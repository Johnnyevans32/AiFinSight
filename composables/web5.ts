import { notify } from "@kyvg/vue3-notification";
import { DateSort } from "@tbd54566975/dwn-sdk-js";
import { Record } from "@web5/api/dist/types/record";
import { Protocol } from "@web5/api/dist/types/protocol";

import { useAppStore } from "~/store";

export function useWeb5VueUtils() {
  const { $web5 } = useNuxtApp();
  const { myDid } = storeToRefs(useAppStore());

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
    dateCreated?: string
  ) => {
    const { record, status } = await $web5.dwn.records.write({
      data,
      message: {
        protocol: protocolDefinition.protocol,
        protocolPath: schemaPathMap[schema],
        schema: protocolDefinition.types[schema].schema,
        dataFormat: protocolDefinition.types[schema].dataFormats?.[0],
        ...(parentId ? { parentId, contextId: parentId } : {}),
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
  const findRecords = async <T>(schema: string, recordId?: string) => {
    const { records } = await $web5.dwn.records.query({
      from: myDid.value,
      message: {
        filter: {
          protocol: protocolDefinition.protocol,
          schema: protocolDefinition.types[schema].schema,
        },
        dateSort: DateSort.CreatedDescending,
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

  const findPaginatedRecords = async <T>(
    schema: string,
    recordId?: string,
    itemsPerPage = 10
  ) => {
    const { records } = await $web5.dwn.records.query({
      from: myDid.value,
      message: {
        filter: {
          protocol: protocolDefinition.protocol,
          schema: protocolDefinition.types[schema].schema,
        },
        pagination: {
          limit: itemsPerPage,
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

  return {
    findRecords,
    updateRecord,
    deleteRecord,
    createRecord,
    configureProtocol,
    validateDwnEnpoint,
    findOrUpdateRecord,
  };
}
