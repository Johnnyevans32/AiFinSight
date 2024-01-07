<template>
  <div class="grid grid-cols-4 gap-y-4">
    <div class="col-span-4 md:col-start-2 md:col-span-2">
      <div class="grid grid-cols-1 gap-2 text-center p-5">
        <div class="flex gap-4 text-center items-center justify-center">
          <overview-card
            icon="fa-solid fa-shopping-cart"
            :value="
              formatMoney(overviewData.thisMonth.expense[Currency.NGN] || 0)
            "
            :difference="overviewData.percentageDiff.expense[Currency.NGN] || 0"
            label="this month expense"
            :currency="currencySignMap[Currency.NGN]"
          />

          <overview-card
            icon="fa-solid fa-money-bill-trend-up"
            :value="
              formatMoney(overviewData.thisMonth.income[Currency.NGN] || 0)
            "
            :difference="overviewData.percentageDiff.income[Currency.NGN] || 0"
            label="this month income"
            :currency="currencySignMap[Currency.NGN]"
          />
        </div>

        <div class="mb-5 grid grid-cols-2 justify-items-start">
          <h1 class="text-xl font-bold">Transactions</h1>
        </div>
        <div v-if="!transactions.length">
          <font-awesome-icon
            class="text-7xl mb-5"
            icon="fa-solid fa-magnifying-glass-dollar"
          />
          <p>No transactions yet</p>
          <p>Your transactions will appear here once they arrive.</p>
        </div>
        <div
          v-else
          v-for="(transactions, date) in formatedTransactions"
          :key="date"
          class="text-left"
        >
          <span>{{ date }}</span>
          <div
            v-for="txn in transactions"
            :key="txn.recordId"
            class="p-5 flex mb-2 items-center h-16 justify-between rounded-xl text-base bg-lightbase"
            @click="viewSingleTransaction(txn)"
          >
            <div class="flex space-x-2 items-center">
              <div class="text-xl">
                <font-awesome-icon
                  v-if="txn?.type === TransactionType.DEBIT"
                  icon="fa-solid fa-square-caret-down"
                  class="text-red-400"
                />
                <font-awesome-icon
                  v-else
                  icon="fa-solid fa-square-caret-up"
                  class="text-green-400"
                />
              </div>

              <div class="flex flex-col text-left">
                <span class="capitalize font-extrabold">{{ txn?.type }}</span>
                <span class="text-xs">{{ shortenString(txn.narration) }}</span>
              </div>
            </div>
            <div class="flex flex-col text-right">
              <span class="font-bold"
                >{{ txn.currencySign }} {{ formatMoney(txn.amount) }}
              </span>
              <span class="font-thin text-sm"
                >{{ txn.currencySign }} {{ formatMoney(txn.balance) }}</span
              >
            </div>
          </div>
        </div>
        <CommonPaginationBar
          v-show="transactions.length"
          :currentPage="currentPage"
          :totalItems="transactions.length"
          @change-option="handlePageChange"
        />
      </div>
    </div>
    <CommonModal
      :open="updateTransactionModal"
      title="Transaction Details"
      @change-modal-status="changeModalStatus"
    >
      <div class="flex flex-col gap-2">
        <div class="flex flex-col">
          <span
            >You
            {{
              modalTransaction?.type === TransactionType.DEBIT
                ? "sent"
                : "received"
            }}</span
          >
          <span class="font-bold"
            >{{ modalTransaction?.currencySign }}
            {{ formatMoney(modalTransaction?.amount || 0) }}</span
          >
        </div>

        <div class="flex flex-col">
          <span>Account Balance After:</span>
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
            formatDate(modalTransaction.date, "MMMM Do YYYY, h:mm:ss a")
          }}</span>
        </div>

        <div class="flex flex-col">
          <span>Label transaction:</span>
          <CommonListBox
            :selected="modalTransaction?.category"
            :options="Object.values(TransactionCategory)"
            @change-option="handleModalTransactionCategoryChange"
          />
        </div>

        <div
          class="mt-5 flex space-x-3 font-bold border-t-[1px] border-base pt-5"
        >
          <CommonButton
            text="Cancel"
            @btn-action="updateTransactionModal = false"
            custom-css="bg-red-400 w-full"
          />
          <CommonButton
            text="Label Transaction"
            @btn-action="updateTransaction"
            custom-css="bg-green-400 w-full"
            :loading="updateTransactionBtnLoading"
          />
        </div>
      </div>
    </CommonModal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import moment from "moment";

import { ACCOUNT_TRANSACTIONS } from "~/services/schemas";
import { useAppStore } from "~/store";
import {
  type AccountStatementDTO,
  ChartPeriodEnum,
  currencySignMap,
} from "~/types/accounts";
import { TransactionType, Currency, TransactionCategory } from "../types/mono";
import { notify } from "@kyvg/vue3-notification";

export default defineComponent({
  async setup() {
    const { transactions } = storeToRefs(useAppStore());
    const { setTransactions } = useAppStore();
    const { updateRecord } = useAppVueUtils();
    const currentPage = ref(1);

    const updateTransactionModal = ref(false);
    const updateTransactionBtnLoading = ref(false);
    const modalTransaction = ref<AccountStatementDTO | null>(null);

    const paginatedTransactions = computed(() => {
      return paginate<AccountStatementDTO>(
        transactions.value,
        currentPage.value,
        10,
        "date"
      );
    });

    const formatedTransactions = computed<
      Record<string, AccountStatementDTO[]>
    >(() => groupByDate(paginatedTransactions.value, "date"));

    const overviewData = computed(() => {
      const startOfThisMonth = moment().startOf("month");
      const endOfThisMonth = moment().endOf("month");
      const startOfLastMonth = moment().subtract(1, "months").startOf("month");
      const endOfLastMonth = moment().subtract(1, "months").endOf("month");

      let thisMonthIncome: Record<string, number> = {};
      let thisMonthExpense: Record<string, number> = {};
      let lastMonthIncome: Record<string, number> = {};
      let lastMonthExpense: Record<string, number> = {};

      transactions.value.forEach((transaction) => {
        const { date, type, amount, currency } = transaction;
        const transactionDate = moment(date);

        if (
          transactionDate.isBetween(
            startOfThisMonth,
            endOfThisMonth,
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

          const updatedTxns = transactions.value;
          for (const txn of updatedTxns) {
            if (txn.recordId === modalTransaction.value.recordId) {
              txn.category = modalTransaction.value.category;
              break;
            }
          }
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
      transactions,
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
    };
  },
});
</script>
