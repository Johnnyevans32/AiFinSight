<template>
  <div class="grid grid-cols-4 gap-y-4 h-screen">
    <div class="col-span-4 md:col-start-2 md:col-span-2">
      <div class="grid grid-cols-1 gap-2 text-center p-5">
        <div class="mb-5 border-b-[1px] border-base text-left py-5">
          <CommonPageBar mainPage="Analysis" />
        </div>
        <div class="mb-5 grid grid-cols-2 justify-items-start">
          <h1 class="text-xl font-bold">Analysis</h1>
        </div>
        <income-expenses-bar-chart :data="chartData" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import moment from "moment";

import { useAppStore } from "~/store";
import { Currency, TransactionType } from "../types/mono";

export default defineComponent({
  async setup() {
    const { transactions } = storeToRefs(useAppStore());

    const chartData = computed(() => {
      const last12Months: moment.Moment[] = [];
      const currentDate = moment();
      const periods: string[] = [];
      const incomes: number[] = [];
      const expenses: number[] = [];
      const differences: number[] = [];

      for (let i = 0; i < 12; i++) {
        const date = currentDate.clone().subtract(i, "months").startOf("month");
        last12Months.push(date);
        periods.push(date.format("MMM-YYYY"));
      }

      // Filter transactions within the last 12 months
      const filteredTransactions = transactions.value.filter(
        (transaction) =>
          moment(transaction.date).isSameOrAfter(
            currentDate.clone().subtract(11, "months").startOf("month")
          ) && transaction.currency === Currency.NGN
      );

      // Initialize income and expense totals for each period
      const incomeMap = new Map<string, number>();
      const expenseMap = new Map<string, number>();

      // Group transactions by month and calculate income and expenses
      for (const transaction of filteredTransactions) {
        const key = moment(transaction.date).format("MM-YYYY");

        if (!incomeMap.has(key)) {
          incomeMap.set(key, 0);
          expenseMap.set(key, 0);
        }

        if (transaction.type === TransactionType.CREDIT) {
          incomeMap.set(key, incomeMap.get(key)! + transaction.amount);
        } else if (transaction.type === TransactionType.DEBIT) {
          expenseMap.set(key, expenseMap.get(key)! + transaction.amount);
        }
      }

      // Calculate differences for each period
      for (const period of last12Months) {
        const key = period.format("MM-YYYY");
        const income = incomeMap.get(key) || 0;
        const expense = expenseMap.get(key) || 0;

        incomes.push(income);
        expenses.push(-expense); // Expenses are represented as negative values
        differences.push(income - expense);
      }

      return {
        periods,
        incomes,
        expenses,
        differences,
      };
    });

    return { chartData };
  },
});
</script>
