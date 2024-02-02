import { notify } from "@kyvg/vue3-notification";
import { DateSort } from "@tbd54566975/dwn-sdk-js";
import { Record } from "@web5/api/dist/types/record";
import { Protocol } from "@web5/api/dist/types/protocol";
import { useAppStore } from "~/store";

export function useAppVueUtils() {
  const config = useRuntimeConfig();
  const { $web5 } = useNuxtApp();

  const { myDid } = storeToRefs(useAppStore());

  const useCustomFetch = async <T>(url: string, options?: any): Promise<T> => {
    const res = await $fetch<T>(url, {
      ...options,
      async onResponseError({ response }) {},

      async onRequest({ request, options }) {},
      async onRequestError({ request, options, error }) {},
    });

    return res;
  };

  const $launchMono = (options: any) => {
    const connect = new Connect({
      key: config.public.monoPublicKey,
      ...options,
    });
    connect.setup();
    connect.open();
  };

  const validateDwnEnpoint = async (dwnUrl: string) => {
    try {
      const healthCheck = await fetch(`${dwnUrl}/health`);

      return healthCheck.ok;
    } catch (err) {
      return false;
    }
  };

  const configureProtocol = async () => {
    const { protocols, status } = await $web5.dwn.protocols.query({
      message: {
        filter: {
          protocol: protocolDefinition.protocol,
        },
      },
    });
    console.log({ status, protocols });

    if (status.code !== 200) {
      notify({
        type: "error",
        title: "error querying protocols",
      });
      return;
    }

    // if (protocols.length > 0) {
    //   return;
    // }

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

    console.log({ configureStatus, protocol });
  };

  const createRecord = async <T>(
    data: T,
    schema: string,
    parentId?: string
  ) => {
    try {
      const { record, status } = await $web5.dwn.records.write({
        data,
        message: {
          protocol: protocolDefinition.protocol,
          protocolPath: schemaPathMap[schema],
          schema: protocolDefinition.types[schema].schema,
          dataFormat: protocolDefinition.types[schema].dataFormats?.[0],
          ...(parentId ? { parentId, contextId: parentId } : {}),
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
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
  const findRecords = async <T>(schema: string, recordId?: string) => {
    const { records } = await $web5.dwn.records.query({
      from: myDid.value,
      message: {
        filter: {
          protocol: protocolDefinition.protocol,
          schema: protocolDefinition.types[schema].schema,
        },
        dateSort: DateSort.CreatedAscending,
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
    const { record } = await $web5.dwn.records.read({
      message: {
        filter: { recordId },
      },
    });
    await record.update({ data });
    syncToUserDwn(record);
  };
  const deleteRecord = async (recordId: string, schema: string) => {
    await $web5.dwn.records.delete({
      message: {
        recordId,
      },
    });
  };

  const syncToUserDwn = async (
    record: Record | Protocol,
    targetDid: string = myDid.value
  ) => {
    const { status: sendStatus } = await record.send(targetDid);

    if (sendStatus.code !== 202) {
      console.log("Unable to send to target did:" + sendStatus);
      return;
    } else {
      console.log("record sent to user remote dwn");
    }
  };

  return {
    useCustomFetch,
    $launchMono,
    findRecords,
    updateRecord,
    deleteRecord,
    createRecord,
    configureProtocol,
    validateDwnEnpoint,
  };
}
