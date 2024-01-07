import { notify } from "@kyvg/vue3-notification";
import { DateSort } from "@tbd54566975/dwn-sdk-js";

export function useAppVueUtils() {
  const config = useRuntimeConfig();
  const { $web5 } = useNuxtApp();

  const routeTo = async (route: string, query = {}, external = false) => {
    return await navigateTo(
      {
        path: route,
        query,
      },
      { external }
    );
  };
  const groupBy = <T extends Record<string | number, any>>(
    array: T[],
    property: keyof T
  ): Record<string | number, T> => {
    return array.reduce((acc: Record<string | number, T>, obj: T) => {
      const key = obj[property];
      if (!acc[key]) {
        acc[key] = obj;
      }
      return acc;
    }, {} as Record<string | number, T>);
  };

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

  const createRecord = async <T>(data: T, schema: string) => {
    const record = await $web5.dwn.records.create({
      data,
      message: {
        schema: `http://some-schema-registry.org/${schema}`,
        dataFormat: "application/json",
      },
    });
    return record;
  };
  const findRecords = async <T>(schema: string, recordId?: string) => {
    const { records } = await $web5.dwn.records.query({
      message: {
        filter: {
          schema: `http://some-schema-registry.org/${schema}`,
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

  const findPaginatedRecords = async <T>(schema: string, itemsPerPage = 10) => {
    const { records } = await $web5.dwn.records.query({
      message: {
        filter: {
          schema: `http://some-schema-registry.org/${schema}`,
        },
        dateSort: DateSort.CreatedAscending,
        pagination: { limit: itemsPerPage },
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

  return {
    useCustomFetch,
    $launchMono,
    routeTo,
    findRecords,
    updateRecord,
    deleteRecord,
    createRecord,
    groupBy,
  };
}
