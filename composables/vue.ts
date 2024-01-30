import { notify } from "@kyvg/vue3-notification";
import { DateSort } from "@tbd54566975/dwn-sdk-js";

export function useAppVueUtils() {
  const config = useRuntimeConfig();
  const { $web5 } = useNuxtApp();

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

    if (status.code !== 200) {
      notify({
        type: "error",
        title: "error querying protocols",
      });
      return;
    }

    if (protocols.length > 0) {
      return;
    }

    const { status: configureStatus, protocol } =
      await $web5.dwn.protocols.configure({
        message: {
          definition: protocolDefinition,
        },
      });
  };

  const createRecord = async <T>(
    data: T,
    schema: string,
    parentId?: string
  ) => {
    const { record } = await $web5.dwn.records.create({
      data,

      message: {
        protocol: protocolDefinition.protocol,
        protocolPath: schemaPathMap[schema],
        schema: protocolDefinition.types[schema].schema,
        dataFormat: protocolDefinition.types[schema].dataFormats?.[0],
        ...(parentId ? { parentId, contextId: parentId } : {}),
      },
    });

    if (!record) {
      return;
    }
    return { ...data, recordId: record?.id };
  };
  const findRecords = async <T>(schema: string, recordId?: string) => {
    const { records } = await $web5.dwn.records.query({
      message: {
        filter: {
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
  };
  const deleteRecord = async (recordId: string, schema: string) => {
    await $web5.dwn.records.delete({
      message: {
        recordId,
      },
    });
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
