<template>
  <div class="grid grid-cols-4 gap-y-4 min-h-screen">
    <div class="col-span-4 md:col-start-2 md:col-span-2">
      <div class="grid grid-cols-1 gap-2 text-center p-5">
        <div class="mb-5 border-b-[1px] border-base text-left py-5">
          <CommonPageBar mainPage="Accounts" />
        </div>
        <div class="mb-5 grid grid-cols-2 justify-items-start">
          <h1 class="text-xl font-bold">Accounts</h1>

          <CommonButton
            text="Link Account"
            @btn-action="launchMono"
            customCss="justify-self-end"
          />
        </div>
        <div v-if="!accounts.length">
          <font-awesome-icon class="text-7xl mb-5" icon="university" />
          <p>Nothing to see here</p>
          <p>
            Connect your accounts to get started with your financial insights.
          </p>
        </div>
        <div
          v-else
          v-for="account in accounts"
          :key="account.recordId"
          :style="{
            background: `linear-gradient(to right, ${account.bankLogoMutedColor}, ${account.bankLogoVibrantColor})`,
            color: account.bankLogoTextColor,
          }"
          class="cursor-pointer p-5 flex items-center h-16 justify-between rounded-xl"
          @click="viewSingleAccount(account)"
        >
          <div class="flex space-x-3 items-center">
            <div class="w-14">
              <img
                v-if="account.bankLogo"
                :src="account.bankLogo"
                width="60"
                class="rounded-xl"
                :alt="`${account.bankName.toLowerCase()} logo`"
              />
              <div
                v-else
                class="bg-base h-10 w-10 text-white rounded-xl flex items-center justify-center text-xl"
              >
                {{ account.bankName.split("")[0] }}
              </div>
            </div>

            <div class="flex flex-col text-left">
              <span class="capitalize font-bold">{{ account.bankName }}</span>
              <span class="">{{ account.accountNumber }}</span>
            </div>
          </div>
          <span class="capitalize text-sm"
            >{{ account.currencySign }} {{ formatMoney(account.balance) }}</span
          >
        </div>
      </div>
    </div>
    <CommonModal
      :open="viewSingleAccountModal"
      title="Account Details"
      @change-modal-status="changeModalStatus"
    >
      <template v-slot:content>
        <div class="flex flex-col gap-2">
          <div class="flex flex-col">
            <span>Bank Name:</span>
            <span class="font-bold flex items-center gap-2">
              <img
                :src="modalAccount?.bankLogo"
                class="w-10 h-10 rounded-xl"
                :alt="`${modalAccount?.bankName.toLowerCase()} logo`"
              />
              <span class="font-bold">{{ modalAccount?.bankName }}</span>
            </span>
          </div>

          <div class="flex flex-col">
            <span>Account Name</span>
            <span class="font-bold">{{ modalAccount?.accountName }}</span>
          </div>

          <div class="flex flex-col">
            <span>Account Number</span>
            <span class="font-bold">{{ modalAccount?.accountNumber }}</span>
          </div>

          <div class="flex flex-col">
            <span>Account Balance</span>
            <span class="font-bold"
              >{{ modalAccount?.currencySign }}
              {{ formatMoney(modalAccount?.balance || 0) }}</span
            >
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <CommonButton
          text="Unlink Account"
          @btn-action="
            () => {
              viewSingleAccountModal = false;
              confirmUnlinkModal = true;
            }
          "
          custom-css="bg-red-400 w-full"
        />
        <CommonButton
          text="Close Modal"
          @btn-action="viewSingleAccountModal = false"
          custom-css="bg-green-400 w-full"
        />
      </template>
    </CommonModal>
    <CommonConfirmationModal
      :open="confirmUnlinkModal"
      title="Confirm account unlink"
      desc="Are you sure you want to unlink your connected bank account? This action will remove the link between your account and this platform. Please be aware that all financial data associated with this bank account will be deleted. Confirm your decision to proceed with the unlinking process."
      :loading="unlinkBtnLoading"
      @change-modal-status="(value) => (confirmUnlinkModal = value)"
      @confirm-modal-action="unlinkAccount"
    />
  </div>
</template>
<script lang="ts">
import { notify } from "@kyvg/vue3-notification";
import { defineComponent } from "vue";

import {
  ACCOUNTS,
  ACCOUNT_TRANSACTIONS,
  ACCOUNT_ASSETS,
} from "~/services/schemas";
import { useAppStore } from "~/store";
import type {
  AccountAssetDTO,
  AccountDTO,
  AccountStatementDTO,
} from "~/types/accounts";

export default defineComponent({
  async setup() {
    useSeoMeta({
      title: "Accounts",
      ogTitle: "Accounts",
    });
    const { $api } = useNuxtApp();
    const { createRecord, $launchMono, findRecords, deleteRecord } =
      useAppVueUtils();
    const { accounts, transactions, assets } = storeToRefs(useAppStore());
    const viewSingleAccountModal = ref(false);
    const unlinkBtnLoading = ref(false);
    const modalAccount = ref<AccountDTO | null>(null);

    const confirmUnlinkModal = ref(false);

    const {
      setAccounts,
      setAssets,
      setTransactions,
      updateLoadingScreenStatus,
    } = useAppStore();

    const linkAccount = async (code: string) => {
      const accountId = await $api.accountService.connect(code);
      if (accounts.value.find((a) => a.accountId === accountId)) {
        notify({
          type: "info",
          title: "account already linked",
        });
        return;
      }
      const [accountDetail, accountStatement, accountAssets] =
        await Promise.all([
          $api.accountService.getAccountDetail(accountId),
          $api.accountService.getAccountStatement(accountId),
          $api.accountService.getAccountAssets(accountId),
        ]);

      const createRecordPromises: Promise<any>[] = [];

      const accountRecord = await createRecord(accountDetail, ACCOUNTS);

      for (const item of accountStatement) {
        createRecordPromises.push(
          createRecord(item, ACCOUNT_TRANSACTIONS, accountRecord?.recordId)
        );
      }

      for (const item of accountAssets) {
        createRecordPromises.push(
          createRecord(item, ACCOUNT_ASSETS, accountRecord?.recordId)
        );
      }
      await Promise.all(createRecordPromises);

      const [dbAccounts, dbTransactions, dbAssets] = await Promise.all([
        findRecords<AccountDTO[]>(ACCOUNTS),
        findRecords<AccountStatementDTO[]>(ACCOUNT_TRANSACTIONS),
        findRecords<AccountAssetDTO[]>(ACCOUNT_ASSETS),
      ]);
      setAccounts(dbAccounts);
      setTransactions(dbTransactions);
      setAssets(dbAssets);

      notify({
        type: "success",
        title: "account connected",
      });
    };

    const launchMono = async () => {
      const options = {
        onSuccess: async function (response: { code: string }) {
          try {
            updateLoadingScreenStatus(true);
            await linkAccount(response.code);
          } catch (err) {
            console.error(err);
            notify({
              type: "error",
              title: "error occurred",
            });
          } finally {
            updateLoadingScreenStatus(false);
          }
        },
        onClose: function () {
          notify({
            type: "info",
            title: "user closed the widget",
          });
        },
      };
      $launchMono(options);
    };

    const changeModalStatus = (newVal: boolean) => {
      viewSingleAccountModal.value = newVal;
    };

    const viewSingleAccount = (account: AccountDTO) => {
      modalAccount.value = account;
      viewSingleAccountModal.value = true;
    };

    const unlinkAccount = async () => {
      try {
        unlinkBtnLoading.value = true;
        const { value: modalAccountValue } = modalAccount;

        if (modalAccountValue && modalAccountValue.recordId) {
          const { accountId, recordId } = modalAccountValue;
          const { value: transactionsValue } = transactions;
          const { value: assetsValue } = assets;

          await $api.accountService.disconnect(accountId);

          const deleteRecordPromises = [
            deleteRecord(recordId, ACCOUNTS),
            ...transactionsValue
              .filter((txn) => txn.accountId === accountId)
              .map((txn) =>
                deleteRecord(txn.recordId || "", ACCOUNT_TRANSACTIONS)
              ),
            ...assetsValue
              .filter((asset) => asset.accountId === accountId)
              .map((asset) =>
                deleteRecord(asset.recordId || "", ACCOUNT_ASSETS)
              ),
          ];

          await Promise.all(deleteRecordPromises);

          const updatedAccounts = accounts.value.filter(
            (acc) => acc.accountId !== accountId
          );
          const updatedTransactions = transactionsValue.filter(
            (txn) => txn.accountId !== accountId
          );
          const updatedAssets = assetsValue.filter(
            (asset) => asset.accountId !== accountId
          );

          setAccounts(updatedAccounts);
          setTransactions(updatedTransactions);
          setAssets(updatedAssets);

          notify({
            type: "success",
            title: "account unlinked",
          });
        }
      } finally {
        unlinkBtnLoading.value = false;
      }
    };
    return {
      accounts,
      launchMono,
      viewSingleAccountModal,
      unlinkBtnLoading,
      modalAccount,
      changeModalStatus,
      viewSingleAccount,
      unlinkAccount,
      confirmUnlinkModal,
    };
  },
});
</script>
