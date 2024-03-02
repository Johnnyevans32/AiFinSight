<template>
  <div class="border-b-[1px] border-base text-left py-5">
    <CommonPageBar mainPage="Accounts" />
  </div>
  <div class="flex items-center justify-between">
    <h1 class="text-xl font-bold">Accounts</h1>

    <CommonButton
      text="Link Account"
      @btn-action="launchMono"
      customCss="justify-self-end"
    />
  </div>
  <div
    class="flex justify-between p-5 font-bold rounded-xl border-[1px] bg-lightbase border-base text-left md:text-3xl text-2xl"
  >
    <p>Total Balance</p>
    <p>
      {{ currencySignMap[currency] }}
      {{
        formatMoney(
          accounts
            .filter((acc) => acc.currency === currency)
            .reduce((acc, curr) => {
              return acc + (curr.balance || 0);
            }, 0)
        )
      }}
    </p>
  </div>
  <div v-if="recordIsInPullingState[ACCOUNTS]">
    <div
      v-for="i in 2"
      :key="i"
      class="p-5 cursor-progress flex mb-2 items-center h-16 justify-between rounded-xl text-base bg-lightbase border-[1px] border-base animate-pulse"
    >
      <div class="flex space-x-2 items-center">
        <div class="bg-base h-10 w-10 rounded-xl"></div>

        <div class="flex flex-col gap-2">
          <div class="h-2 w-20 bg-base rounded"></div>
          <div class="h-2 w-28 bg-base rounded"></div>
        </div>
      </div>
      <div class="h-2 w-28 bg-base rounded"></div>
    </div>
  </div>
  <div v-else-if="!accounts.length">
    <font-awesome-icon class="text-7xl mb-5" icon="university" />
    <p>Nothing to see here</p>
    <p>Connect your accounts to get started with your financial insights.</p>
  </div>
  <div v-else class="flex flex-col gap-2">
    <div
      v-for="account in accounts"
      :key="account.recordId"
      :style="
        account.bankLogoMutedColor && {
          background: `linear-gradient(to right, ${account.bankLogoMutedColor}, ${account.bankLogoVibrantColor})`,
          color: account.bankLogoTextColor,
        }
      "
      :class="!account.bankLogoMutedColor && 'bg-lightbase'"
      class="cursor-pointer p-5 flex items-center h-16 justify-between rounded-xl"
      @click="viewSingleAccount(account)"
    >
      <div class="flex space-x-3 items-center">
        <CommonImage :image="account.bankLogo" :alt="account.bankName" />

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

  <CommonModal
    :open="viewSingleAccountModal"
    title="Account details"
    @change-modal-status="changeModalStatus"
  >
    <template v-slot:content>
      <div class="flex flex-col gap-2">
        <div class="flex flex-col">
          <span>Bank Name:</span>
          <span class="font-bold flex items-center gap-2">
            <CommonImage
              :image="modalAccount?.bankLogo"
              :alt="modalAccount?.bankName || ''"
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
        custom-css="bg-red-400 w-full text-black"
      />
      <CommonButton
        text="Close Modal"
        @btn-action="viewSingleAccountModal = false"
        custom-css="!bg-blue-400 w-full text-black"
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
</template>
<script lang="ts">
import { notify } from "@kyvg/vue3-notification";

import { useAppUserConfigStore } from "~/store/config";
import {
  ACCOUNTS,
  ACCOUNT_TRANSACTIONS,
  ACCOUNT_ASSETS,
} from "~/services/schemas";
import { useAppStore } from "~/store";
import {
  type AccountAssetDTO,
  type AccountDTO,
  type AccountStatementDTO,
  currencySignMap,
} from "~/types/accounts";

export default defineComponent({
  async setup() {
    useSeoMeta({
      title: "Accounts",
      ogTitle: "Accounts",
    });
    const { $api } = useNuxtApp();
    const { $launchMono } = useAppVueUtils();
    const { deleteRecordsFromProtocol } = useWeb5VueUtils();

    const { createRecord, findRecords } = useWeb5VueUtils();
    const { accounts, recordIsInPullingState } = storeToRefs(useAppStore());
    const { currency } = storeToRefs(useAppUserConfigStore());
    const { updateLoadingScreenText } = useAppStore();
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

      const accountRecord = await createRecord(accountDetail, ACCOUNTS);

      const createRecordPromises: Promise<any>[] = [
        ...accountStatement.map((item) =>
          createRecord(
            item,
            ACCOUNT_TRANSACTIONS,
            accountRecord?.recordId,
            item.date
          )
        ),
        ...accountAssets.map((item) =>
          createRecord(item, ACCOUNT_ASSETS, accountRecord?.recordId)
        ),
      ];

      await trackMigrationProgress(createRecordPromises);

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

    const trackMigrationProgress = async (promises: Promise<any>[]) => {
      const totalPromises = promises.length;
      let completedPromises = 0;
      let loadingProgress = 0;

      const updateProgress = () => {
        completedPromises++;
        loadingProgress = Math.floor((completedPromises / totalPromises) * 100);
        updateLoadingScreenText(
          `Transferring your financial data from your bank to dwn. Progress: ${loadingProgress}%. Please hold on, we're almost there!`
        );
      };

      await Promise.allSettled(
        promises.map((promise) => promise.then(updateProgress))
      );
      updateLoadingScreenText(
        "Finalizing migration cleanup... We're almost done!"
      );
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

    const unlinkAccount = async () => {
      try {
        unlinkBtnLoading.value = true;
        const { value: modalAccountValue } = modalAccount;

        if (modalAccountValue && modalAccountValue.recordId) {
          const { accountId } = modalAccountValue;

          await deleteRecordsFromProtocol(false, [accountId]);

          notify({
            type: "success",
            title: "account unlinked",
          });
        }
      } finally {
        unlinkBtnLoading.value = false;
        confirmUnlinkModal.value = false;
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
      ACCOUNTS,
      recordIsInPullingState,
      currency,
      currencySignMap,
    };
  },
});
</script>
