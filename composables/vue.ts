import { notify } from "@kyvg/vue3-notification";
import { DateSort } from "@tbd54566975/dwn-sdk-js";
import { Record } from "@web5/api/dist/types/record";
import { Protocol } from "@web5/api/dist/types/protocol";
import { useAppStore } from "~/store";
import {
  ACCOUNTS,
  ACCOUNT_TRANSACTIONS,
  ACCOUNT_ASSETS,
  BUDGETS,
  CONVERSATIONS,
} from "~/services/schemas";

export function useAppVueUtils() {
  const config = useRuntimeConfig();
  const { $web5 } = useNuxtApp();
  const { $api } = useNuxtApp();

  const { myDid, transactions, assets, accounts, budgets, conversations } =
    storeToRefs(useAppStore());
  const {
    setAccounts,
    setTransactions,
    setAssets,
    setConversations,
    setBudgets,
  } = useAppStore();

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

  const deleteRecordsFromProtocol = async (
    deleteAll = false,
    accountIds: string[] = accounts.value.map((acc) => acc.accountId)
  ) => {
    accountIds.map((accountId) => $api.accountService.disconnect(accountId));

    const deleteRecordPromises = [
      ...accounts.value
        .filter(
          (account) => accountIds.includes(account.accountId) || deleteAll
        )
        .map((account) => deleteRecord(account.recordId || "", ACCOUNTS)),
      ...transactions.value
        .filter((txn) => accountIds.includes(txn.accountId) || deleteAll)
        .map((txn) => deleteRecord(txn.recordId || "", ACCOUNT_TRANSACTIONS)),
      ...assets.value
        .filter((asset) => accountIds.includes(asset.accountId) || deleteAll)
        .map((asset) => deleteRecord(asset.recordId || "", ACCOUNT_ASSETS)),
      ...(deleteAll
        ? budgets.value.map((budget) =>
            deleteRecord(budget.recordId || "", BUDGETS)
          )
        : []),
      ...(deleteAll
        ? conversations.value.map((conversation) =>
            deleteRecord(conversation.recordId || "", CONVERSATIONS)
          )
        : []),
    ];

    await Promise.all(deleteRecordPromises);
    const updatedAccounts = accounts.value.filter(
      (acc) => !accountIds.includes(acc.accountId) && !deleteAll
    );
    const updatedTransactions = transactions.value.filter(
      (txn) => !accountIds.includes(txn.accountId) && !deleteAll
    );
    const updatedAssets = assets.value.filter(
      (asset) => !accountIds.includes(asset.accountId) && !deleteAll
    );

    setAccounts(updatedAccounts);
    setTransactions(updatedTransactions);
    setAssets(updatedAssets);

    if (deleteAll) {
      setAccounts([]);
      setConversations([]);
    }
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
    parentId?: string,
    dateCreated?: string
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

  return {
    useCustomFetch,
    $launchMono,
    findRecords,
    updateRecord,
    deleteRecord,
    createRecord,
    configureProtocol,
    validateDwnEnpoint,
    deleteRecordsFromProtocol,
  };
}
