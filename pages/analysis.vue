<template>
  <div class="border-b-[1px] border-base text-left py-5">
    <CommonPageBar mainPage="Analysis" />
  </div>

  <income-expenses-bar-chart :data="chartData" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import moment from "moment";

import { useAppStore } from "~/store";
import { TransactionType } from "~/types/mono";
import { useAppUserConfigStore } from "~/store/config";

export default defineComponent({
  async setup() {
    useSeoMeta({
      title: "Analysis",
      ogTitle: "Analysis",
    });
    const { transactions } = storeToRefs(useAppStore());
    const { currency } = storeToRefs(useAppUserConfigStore());

    const chartData = computed(() => {
      const last12Months: moment.Moment[] = [];
      const currentDate = moment();
      const periods: string[] = [];
      const incomes: number[] = [];
      const expenses: number[] = [];
      const differences: number[] = [];

      for (let i = 12; i >= 0; i--) {
        const date = currentDate.clone().subtract(i, "months").startOf("month");
        last12Months.push(date);
        periods.push(date.format("MMM YY"));
      }

      // Filter transactions within the last 12 months
      const filteredTransactions = transactions.value.filter(
        (transaction) =>
          moment(transaction.date).isSameOrAfter(
            currentDate.clone().subtract(11, "months").startOf("month")
          ) && transaction.currency === currency.value
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
