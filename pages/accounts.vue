<template>
  <div class="grid grid-cols-4 gap-y-4 h-screen">
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
          <font-awesome-icon
            class="text-7xl mb-5"
            icon="fa-solid fa-magnifying-glass-dollar"
          />
          <p>Nothing to see here</p>
          <p>Link an account to begin your financial management journey</p>
        </div>
        <div
          v-else
          v-for="account in accounts"
          :key="account.recordId"
          class="cursor-pointer p-5 flex items-center h-16 justify-between rounded-xl text-base bg-lightbase"
          @click="viewSingleAccount(account)"
        >
          <div class="flex space-x-3 items-center">
            <img
              :src="account.bankLogo"
              width="60"
              :alt="`${account.bankName.toLowerCase()} logo`"
            />
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
      <div class="flex flex-col gap-2">
        <img
          :src="modalAccount?.bankLogo"
          width="100"
          :alt="`${modalAccount?.bankName.toLowerCase()} logo`"
        />
        <div class="flex flex-col">
          <span>Bank Name:</span>
          <span class="font-bold">{{ modalAccount?.bankName }}</span>
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

        <div
          class="mt-5 flex space-x-3 font-bold border-t-[1px] border-base pt-5"
        >
          <CommonButton
            text="Unlink Account"
            @btn-action="unlinkAccount"
            :disabled="true"
            custom-css="bg-red-400 w-full"
            :loading="unlinkeBtnLoading"
          />
          <CommonButton
            text="Close Modal"
            @btn-action="viewSingleAccountModal = false"
            custom-css="bg-green-400 w-full"
          />
        </div>
      </div>
    </CommonModal>
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
    const { $api } = useNuxtApp();
    const { createRecord, $launchMono, findRecords } = useAppVueUtils();
    const { accounts } = storeToRefs(useAppStore());
    const viewSingleAccountModal = ref(false);
    const unlinkeBtnLoading = ref(false);
    const modalAccount = ref<AccountDTO | null>(null);

    const {
      setAccounts,
      setAssets,
      setTransactions,
      updateLoadingScreenStatus,
    } = useAppStore();

    onBeforeMount(async () => {
      try {
      } catch (err) {
        console.log("before mount error", { err });
      }
    });

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

      createRecordPromises.push(createRecord(accountDetail, ACCOUNTS));

      for (const item of accountStatement) {
        createRecordPromises.push(createRecord(item, ACCOUNT_TRANSACTIONS));
      }

      for (const item of accountAssets) {
        createRecordPromises.push(createRecord(item, ACCOUNT_ASSETS));
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

    const unlinkAccount = () => {
      notify({
        type: "info",
        title: "feature not avaiable at the moment ",
      });
    };
    return {
      accounts,
      launchMono,
      viewSingleAccountModal,
      unlinkeBtnLoading,
      modalAccount,
      changeModalStatus,
      viewSingleAccount,
      unlinkAccount,
    };
  },
});
</script>
