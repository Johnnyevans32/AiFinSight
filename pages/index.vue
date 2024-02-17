<template>
  <div class="flex items-center justify-between">
    <h1 class="text-xl font-bold">Overview</h1>
    <CommonFormSelect
      :selected="overviewMonth"
      :options="overviewMonthOptions"
      @change-option="
        (newVal) => {
          overviewMonth = newVal;
        }
      "
    />
  </div>
  <div class="grid grid-cols-2 gap-4">
    <overview-card
      icon="fa-solid fa-shopping-cart"
      :value="formatMoney(overviewData.thisMonth.expense[currency] || 0)"
      :difference="overviewData.percentageDiff.expense[currency] || 0"
      label="Expense"
      :data="overviewData.expenses"
      :periods="overviewData.periods"
      :currency="currencySignMap[currency]"
    />

    <overview-card
      icon="fa-solid fa-money-bill-trend-up"
      :value="formatMoney(overviewData.thisMonth.income[currency] || 0)"
      :difference="overviewData.percentageDiff.income[currency] || 0"
      label="Income"
      :data="overviewData.incomes"
      :periods="overviewData.periods"
      :currency="currencySignMap[currency]"
    />
  </div>
  <div class="flex items-center justify-between">
    <h1 class="md:block hidden text-xl font-bold">Transactions</h1>
    <div class="flex gap-2 items-center md:w-fit w-full">
      <CommonFormInput
        v-model="searchQueryModel"
        inputType="text"
        :placeholder="String.fromCodePoint(0x1f50d) + ' search transactions'"
        @keyup.enter="searchItem"
        class="w-full"
      />
      <!-- <font-awesome-icon
        icon="sync"
        class="bg-lightbase rounded-lg px-5 py-2 hover:bg-base cursor-pointer"
      /> -->
    </div>
  </div>

  <div v-show="recordIsInPullingState[ACCOUNT_TRANSACTIONS]">
    <div v-for="i in 2" :key="i">
      <div class="h-2 w-20 bg-base rounded mb-2"></div>
      <div
        v-for="i in 2"
        :key="i"
        class="cursor-progress p-5 flex mb-2 items-center h-16 justify-between rounded-xl text-base bg-lightbase border-[1px] border-base animate-pulse"
      >
        <div class="flex space-x-2 items-center">
          <div class="bg-base h-10 w-10 rounded-xl"></div>

          <div class="flex flex-col gap-2">
            <div class="h-2 w-20 bg-base rounded"></div>
            <div class="h-2 w-28 bg-base rounded"></div>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="h-2 w-28 bg-base rounded"></div>
          <div class="h-2 w-20 bg-base rounded self-end"></div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-show="
      !Object.keys(formatedTransactions).length &&
      !recordIsInPullingState[ACCOUNT_TRANSACTIONS]
    "
  >
    <font-awesome-icon class="text-7xl mb-5" icon="magnifying-glass-dollar" />
    <p>No transactions yet</p>
    <p>
      Connect your bank accounts and start tracking your financial activity to
      see insights here.
    </p>
  </div>

  <div
    v-show="
      Object.keys(formatedTransactions).length &&
      !recordIsInPullingState[ACCOUNT_TRANSACTIONS]
    "
  >
    <div
      v-for="(transactions, date) in formatedTransactions"
      :key="date"
      class="text-left"
    >
      <span>{{ date }}</span>
      <div
        v-for="txn in transactions"
        :key="txn.recordId"
        class="cursor-pointer p-5 flex mb-2 items-center h-16 justify-between rounded-xl text-base bg-lightbase border-[1px] border-base"
        @click="viewSingleTransaction(txn)"
      >
        <div class="flex space-x-2 items-center">
          <div class="text-sm transform translate-y-0">
            <CommonImage
              :image="accountsGroupedById[txn.accountId]?.bankLogo"
              :alt="accountsGroupedById[txn.accountId]?.bankName"
            />
            <font-awesome-icon
              v-if="txn?.type === TransactionType.DEBIT"
              icon="fa-solid fa-circle-right"
              :style="{ transform: 'rotate(315deg)' }"
              class="text-red-600 rounded-xl bg-white absolute -bottom-[1px] -right-[1px] border-[1px] border-white"
            />
            <font-awesome-icon
              v-else
              icon="fa-solid fa-circle-right"
              :style="{ transform: 'rotate(135deg)' }"
              class="text-green-600 rounded-xl bg-white absolute -bottom-[1px] -right-[1px] border-[1px] border-white"
            />
          </div>

          <div class="flex flex-col text-left">
            <span class="capitalize font-extrabold">{{
              txn?.category?.replaceAll("_", " ") || TransactionCategory.UNKNOWN
            }}</span>
            <span class="text-xs">{{ shortenString(txn.narration) }}</span>
          </div>
        </div>
        <div class="flex flex-col text-right">
          <span
            class="font-bold"
            :class="
              txn?.type === TransactionType.CREDIT ? 'text-green-600' : ''
            "
            >{{ txn.currencySign }} {{ formatMoney(txn.amount) }}
          </span>
          <span class="font-thin text-sm"
            >{{ txn.currencySign }} {{ formatMoney(txn.balance) }}</span
          >
        </div>
      </div>
    </div>
    <CommonPaginationBar
      v-show="transactionsInPageView.length"
      :currentPage="currentPage"
      :totalItems="transactionsInPageView.length"
      @change-option="handlePageChange"
    />
  </div>

  <CommonModal
    v-if="modalTransaction"
    :open="updateTransactionModal"
    title="Transaction details"
    @change-modal-status="changeModalStatus"
  >
    <template v-slot:content>
      <div class="flex flex-col gap-2">
        <div class="flex flex-col">
          <span
            >You
            {{
              modalTransaction?.type === TransactionType.DEBIT
                ? "sent"
                : "received"
            }}:</span
          >
          <span class="font-bold"
            >{{ modalTransaction?.currencySign }}
            {{ formatMoney(modalTransaction?.amount || 0) }}</span
          >
        </div>

        <div class="flex flex-col">
          <span>Source bank account:</span>
          <span class="font-bold flex items-center gap-2">
            <CommonImage
              :image="accountsGroupedById[modalTransaction.accountId]?.bankLogo"
              :alt="accountsGroupedById[modalTransaction.accountId]?.bankName"
            />
            {{ accountsGroupedById[modalTransaction.accountId]?.accountNumber }}
          </span>
        </div>
        <div class="flex flex-col">
          <span>Bank account balance after:</span>
          <span class="font-bold"
            >{{ modalTransaction?.currencySign }}
            {{ formatMoney(modalTransaction?.balance || 0) }}</span
          >
        </div>

        <div class="flex flex-col">
          <span>Description:</span>
          <span class="font-bold">{{ modalTransaction?.narration }}</span>
        </div>

        <div class="flex flex-col">
          <span>Date:</span>
          <span class="font-bold">{{
            modalTransaction?.date &&
            formatDate(modalTransaction.date, "ddd, MMM Do YYYY, h:mm:ss a")
          }}</span>
        </div>

        <div class="flex flex-col">
          <span>Label transaction category:</span>
          <CommonFormSelect
            :selected="modalTransaction?.category"
            :options="Object.values(TransactionCategory)"
            @change-option="handleModalTransactionCategoryChange"
          />
        </div>
      </div>
    </template>

    <template v-slot:footer>
      <CommonButton
        text="Cancel"
        @btn-action="updateTransactionModal = false"
        custom-css="bg-red-400 w-full text-black"
      />
      <CommonButton
        text="Label Transaction"
        @btn-action="updateTransaction"
        custom-css="!bg-blue-400 w-full text-black"
        :loading="updateTransactionBtnLoading"
      />
    </template>
  </CommonModal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import moment from "moment";
import { notify } from "@kyvg/vue3-notification";

import { ACCOUNT_TRANSACTIONS } from "~/services/schemas";
import { useAppStore } from "~/store";
import {
  type AccountStatementDTO,
  ChartPeriodEnum,
  currencySignMap,
  TransactionType,
  Currency,
  TransactionCategory,
} from "~/types/accounts";
import { useAppUserConfigStore } from "~/store/config";

export default defineComponent({
  async setup() {
    const { transactions, accounts, recordIsInPullingState } = storeToRefs(
      useAppStore()
    );
    const { currency } = storeToRefs(useAppUserConfigStore());
    const { setTransactions } = useAppStore();
    const { updateRecord } = useWeb5VueUtils();
    const currentPage = ref(1);

    const overviewMonthOptions = Array.from({ length: 12 }, (_, index) =>
      moment().clone().subtract(index, "months").startOf("month")
    ).map((date) => date.format("MMMM YYYY"));

    const overviewMonth = ref(overviewMonthOptions[0]);

    const searchQueryModel = ref("");
    const updateTransactionModal = ref(false);
    const updateTransactionBtnLoading = ref(false);
    const modalTransaction = ref<AccountStatementDTO | null>(null);

    const transactionsInPageView = ref<AccountStatementDTO[]>(
      transactions.value
    );

    const paginatedTransactions = computed(() => {
      return paginate<AccountStatementDTO>(
        transactionsInPageView.value,
        currentPage.value,
        10,
        "date"
      );
    });

    const searchItem = () => {
      const trimmedSearchQuery = searchQueryModel.value.trim();

      const regex = new RegExp(trimmedSearchQuery, "gi");
      transactionsInPageView.value = transactions.value.filter(
        (txn) =>
          regex.test(txn.category?.toString() || "") ||
          regex.test(txn.narration)
      );
    };

    const accountsGroupedById = computed(() =>
      groupBy(accounts.value, "accountId")
    );

    const incomeMap = new Map<string, number>();
    const expenseMap = new Map<string, number>();

    const formatedTransactions = computed<
      Record<string, AccountStatementDTO[]>
    >(() => groupByDate(paginatedTransactions.value, "date"));

    const overviewData = computed(() => {
      const startOfOverviewMonth = moment(
        overviewMonth.value,
        "MMMM YYYY"
      ).startOf("month");
      const endOfOverviewMonth = moment(overviewMonth.value, "MMMM YYYY").endOf(
        "month"
      );
      const startOfLastMonth = moment(overviewMonth.value, "MMMM YYYY")
        .subtract(1, "months")
        .startOf("month");
      const endOfLastMonth = moment(overviewMonth.value, "MMMM YYYY")
        .subtract(1, "months")
        .endOf("month");

      let thisMonthIncome: Record<string, number> = {};
      let thisMonthExpense: Record<string, number> = {};
      let lastMonthIncome: Record<string, number> = {};
      let lastMonthExpense: Record<string, number> = {};

      const currentDate = moment();
      const periods: string[] = Array.from(
        { length: 12 },
        (_, index) => 11 - index
      ).map((i) => {
        const date = currentDate.clone().subtract(i, "months").startOf("month");

        return date.format("MMM-YYYY");
      });

      const incomes: number[] = [];
      const expenses: number[] = [];

      transactions.value.forEach((transaction) => {
        const { date, type, amount, currency } = transaction;
        const transactionDate = moment(date);

        const key = moment(date).format("MMM-YYYY");

        if (!incomeMap.has(key)) {
          incomeMap.set(key, 0);
          expenseMap.set(key, 0);
        }

        if (transaction.type === TransactionType.CREDIT) {
          incomeMap.set(key, incomeMap.get(key)! + transaction.amount);
        } else if (transaction.type === TransactionType.DEBIT) {
          expenseMap.set(key, expenseMap.get(key)! + transaction.amount);
        }

        if (
          transactionDate.isBetween(
            startOfOverviewMonth,
            endOfOverviewMonth,
            undefined,
            "[]"
          )
        ) {
          if (type === TransactionType.CREDIT) {
            thisMonthIncome[currency] =
              (thisMonthIncome[currency] || 0) + amount;
          } else if (type === TransactionType.DEBIT) {
            thisMonthExpense[currency] =
              (thisMonthExpense[currency] || 0) + amount;
          }
        } else if (
          transactionDate.isBetween(
            startOfLastMonth,
            endOfLastMonth,
            undefined,
            "[]"
          )
        ) {
          if (type === TransactionType.CREDIT) {
            lastMonthIncome[currency] =
              (lastMonthIncome[currency] || 0) + amount;
          } else if (type === TransactionType.DEBIT) {
            lastMonthExpense[currency] =
              (lastMonthExpense[currency] || 0) + amount;
          }
        }
      });

      for (const key of periods) {
        const income = incomeMap.get(key) || 0;
        const expense = expenseMap.get(key) || 0;

        incomes.push(income);
        expenses.push(expense);
      }

      const calculatePercentageDiff = (
        thisMonth: { [x: string]: number },
        lastMonth: { [x: string]: number }
      ) => {
        const percentageDiff: Record<string, number> = {};
        Object.values(Currency).forEach((currency) => {
          if (lastMonth[currency]) {
            percentageDiff[currency] = Math.round(
              (((thisMonth[currency] || 0) - (lastMonth[currency] || 0)) /
                (lastMonth[currency] || 0)) *
                100
            );
          } else {
            percentageDiff[currency] = (thisMonth[currency] || 0) > 0 ? 100 : 0;
          }
        });
        return percentageDiff;
      };

      return {
        thisMonth: { income: thisMonthIncome, expense: thisMonthExpense },
        lastMonth: { income: lastMonthIncome, expense: lastMonthExpense },
        percentageDiff: {
          income: calculatePercentageDiff(thisMonthIncome, lastMonthIncome),
          expense: calculatePercentageDiff(thisMonthExpense, lastMonthExpense),
        },
        incomes,
        expenses,
        periods,
      };
    });

    const handlePageChange = (newVal: number) => {
      currentPage.value = newVal;
    };
    const changeModalStatus = (newVal: boolean) => {
      updateTransactionModal.value = newVal;
    };

    const viewSingleTransaction = (transaction: AccountStatementDTO) => {
      modalTransaction.value = transaction;
      updateTransactionModal.value = true;
    };

    const handleModalTransactionCategoryChange = (newVal: string) => {
      if (modalTransaction.value) {
        modalTransaction.value.category = newVal as TransactionCategory;
      }
    };

    const updateTransaction = () => {
      try {
        if (
          modalTransaction.value &&
          modalTransaction.value.recordId &&
          modalTransaction.value.category
        ) {
          updateRecord(
            modalTransaction.value.recordId,
            modalTransaction.value,
            ACCOUNT_TRANSACTIONS
          );

          const updatedTxns = transactions.value.map((txn) =>
            txn.recordId === modalTransaction.value?.recordId
              ? { ...txn, category: modalTransaction.value?.category }
              : txn
          );
          setTransactions(updatedTxns);

          notify({
            type: "success",
            title: "transaction updated",
          });
        }
      } finally {
        updateTransactionModal.value = false;
      }
    };
    return {
      TransactionType,
      formatedTransactions,
      overviewData,
      ChartPeriodEnum,
      Currency,
      currencySignMap,
      currentPage,
      handlePageChange,
      updateTransactionModal,
      changeModalStatus,
      updateTransaction,
      updateTransactionBtnLoading,
      modalTransaction,
      TransactionCategory,
      handleModalTransactionCategoryChange,
      viewSingleTransaction,
      accountsGroupedById,
      searchQueryModel,
      transactionsInPageView,
      searchItem,
      recordIsInPullingState,
      ACCOUNT_TRANSACTIONS,
      overviewMonthOptions,
      overviewMonth,
      currency,
    };
  },
});
</script>
