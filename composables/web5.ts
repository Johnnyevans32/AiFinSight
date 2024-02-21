import { notify } from "@kyvg/vue3-notification";
import { DateSort } from "@tbd54566975/dwn-sdk-js";
import { Record } from "@web5/api/dist/types/record";
import { Protocol } from "@web5/api/dist/types/protocol";
import { VerifiableCredential } from "@web5/credentials";
import { DidKeyMethod, DidIonMethod } from "@web5/dids";
import { Web5UserAgent } from "@web5/user-agent";
import { ManagedDid, ManagedKeyPair } from "@web5/agent/dist/types";
import { PortableDid } from "@web5/dids/dist/types";
import { Jose } from "@web5/crypto";
import moment from "moment";

import { useAppStore } from "~/store";
import { useAppUserConfigStore } from "~/store/config";

export function useWeb5VueUtils() {
  const { $web5 } = useNuxtApp();
  const { dwnEndpoint } = storeToRefs(useAppUserConfigStore());
  const { myDid } = storeToRefs(useAppStore());
  const { setVcJwt } = useAppStore();

  const validateDwnEnpoint = async (dwnUrl: string) => {
    try {
      const healthCheck = await fetch(`${dwnUrl}/health`);
      return healthCheck.ok;
    } catch (err) {
      return false;
    }
  };

  const configureProtocol = async () => {
    const { status: configureStatus, protocol } =
      await $web5.dwn.protocols.configure({
        message: {
          definition: protocolDefinition,
        },
      });

    if (!protocol) {
      notify({
        type: "error",
        title: "error configuring protocol",
      });
      return;
    }
    syncToUserDwn(protocol);
  };

  const createRecord = async <T>(
    data: T,
    schema: string,
    parentId?: string,
    dateCreated?: string,
    recordId?: string
  ) => {
    const { record, status } = await $web5.dwn.records.write({
      data,
      message: {
        protocol: protocolDefinition.protocol,
        protocolPath: schemaPathMap[schema],
        schema: protocolDefinition.types[schema].schema,
        dataFormat: protocolDefinition.types[schema].dataFormats?.[0],
        ...(parentId ? { parentId, contextId: parentId } : {}),
        ...(recordId ? { recordId } : {}),
        ...(dateCreated
          ? {
              dateCreated: formatToWeb5Date(dateCreated),
              messageTimestamp: formatToWeb5Date(dateCreated),
            }
          : {}),
      },
    });
    if (status.code !== 202) {
      throw Error(status.detail);
    }

    if (!record) {
      return;
    }
    syncToUserDwn(record);

    return { ...data, recordId: record?.id };
  };
  const findRecords = async <T>(
    schema: string,
    recordId?: string,
    dateSort = DateSort.CreatedDescending
  ) => {
    const { records } = await $web5.dwn.records.query({
      from: myDid.value,
      message: {
        filter: {
          protocol: protocolDefinition.protocol,
          schema: protocolDefinition.types[schema].schema,
        },
        dateSort,
        ...(recordId ? { recordId } : {}),
      },
    });
    const loadRecords = await Promise.all(
      (records || []).map(
        async (record: { data: { json: () => any }; id: any }) => {
          const data = await record.data.json();
          return { recordId: record.id, ...data };
        }
      )
    );

    return loadRecords as T;
  };

  const updateRecord = async (recordId: string, data: any, schema: string) => {
    const { record, status } = await $web5.dwn.records.read({
      message: {
        filter: { recordId },
      },
    });
    if (!record) {
      return;
    }
    await record.update({ data });

    syncToUserDwn(record);
  };
  const deleteRecord = async (recordId: string, schema: string) => {
    const { status } = await $web5.dwn.records.delete({
      from: myDid.value,
      message: {
        recordId,
      },
    });

    return { status, recordId };
  };

  const syncToUserDwn = async (
    record: Record | Protocol,
    targetDid: string = myDid.value
  ) => {
    const { status: sendStatus } = await record.send(targetDid);

    if (sendStatus.code !== 202) {
      console.log("Unable to send to target did:", { sendStatus });
      return;
    } else {
      console.log("record sent to user remote dwn", { sendStatus });
    }
  };

  const findOrUpdateRecord = async (
    data: any,
    schema: string,
    upsert = true
  ) => {
    const { record, status } = await $web5.dwn.records.read({
      message: {
        filter: {
          protocol: protocolDefinition.protocol,
          schema: protocolDefinition.types[schema].schema,
        },
      },
    });
    if (!record && upsert) {
      return createRecord(data, schema);
    }
    if (upsert) {
      await record.update({ data });
      syncToUserDwn(record);
    }
    if (!record || status.code === 404) {
      return {};
    }
    const dataInRecord = await record.data.json();

    return {
      ...data,
      ...dataInRecord,
      ...(record ? { recordId: record?.id } : {}),
    };
  };

  const createSignedAuthToken = async () => {
    const { managedDid } = await getUserPortableDidAndAgent();

    const keyDid = await DidKeyMethod.create();

    const authAuthorizationVc = await VerifiableCredential.create({
      type: "AuthAuthorization",
      issuer: managedDid.did,
      subject: managedDid.did,
      data: { data: "ok" },
      expirationDate: moment()
        .add(1, "minutes")
        .toISOString()
        .replace(/\.\d+Z$/, "Z"),
    });

    const signedVcJwt = await authAuthorizationVc.sign({
      did: keyDid,
    });

    // setVcJwt(signedVcJwt);

    console.log({ signedVcJwt, keyDid });

    const verified = await VerifiableCredential.verify({ vcJwt: signedVcJwt });
    console.log({ verified });
  };

  const getUserPortableDidAndAgent = async () => {
    try {
      // A custom Web5Agent implementation was not specified, so use default managed user agent.
      const userAgent = await Web5UserAgent.create();

      // Start the agent.
      await userAgent.start({ passphrase: "insecure-static-phrase" });
      // Query the Agent's DWN tenant for identity records.
      const identities = (await userAgent.identityManager.list()).filter(
        (i) => i.name === AGENT_MANAGER_NAME
      );
      const storedIdentities = identities.length;
      let managedDid: ManagedDid | PortableDid;
      // If an existing identity is not found found, create a new one.
      if (storedIdentities === 0) {
        const didOptions = await DidIonMethod.generateDwnOptions({
          serviceEndpointNodes: [dwnEndpoint.value],
        });
        // Create new DID and generate key set.
        // managedDid = await userAgent.didManager.create({
        //   method: "ion",
        //   kms: "local",
        //   ...didOptions,
        // });

        managedDid = await DidIonMethod.create({
          services: didOptions.services,
        });

        console.log({ managedDid });
        const identity = {
          did: managedDid.did,
          name: AGENT_MANAGER_NAME,
        };
        await userAgent.identityManager.import({
          identity,
          context: userAgent.agentDid,
        });
        await userAgent.didManager.import({
          alias: "",
          did: managedDid,
          context: userAgent.agentDid,
          kms: "local",
        });
      } else {
        const [identity] = identities;

        const result = await userAgent.didManager.get({
          didRef: identity.did,
        });
        if (!result) throw new Error("No did found");

        managedDid = result;
        console.log({ imporefedmanagedDid: managedDid });
        await Promise.all(
          (managedDid.keySet.verificationMethodKeys || []).map(async (key) => {
            const keyData = (await userAgent.keyManager.getKey({
              keyRef: key.keyManagerId || "",
            })) as ManagedKeyPair;
            console.log({ keyData });
            key.privateKeyJwk = (await Jose.cryptoKeyToJwk({
              key: {
                ...(keyData.privateKey as any),
                material: keyData.publicKey.material,
              },
            })) as any;
            console.log("key.privateKeyJwk", key.privateKeyJwk);
          })
        );
      }
      return { managedDid, userAgent };
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
  return {
    findRecords,
    updateRecord,
    deleteRecord,
    createRecord,
    configureProtocol,
    validateDwnEnpoint,
    findOrUpdateRecord,
    createSignedAuthToken,
    getUserPortableDidAndAgent,
  };
}
