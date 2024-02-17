<template>
  <div class="border-b-[1px] border-base text-left py-5">
    <CommonPageBar mainPage="Analysis" />
  </div>

  <chart-income-expense :data="chartData.incomeExpense" />
  <chart-category-spending
    :data="chartData.categoryExpense"
    :periods="chartData.periods"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import moment from "moment";

import { useAppStore } from "~/store";
import { TransactionCategory, TransactionType } from "~/types/accounts";
import { useAppUserConfigStore } from "~/store/config";

export default defineComponent({
  async setup() {
    useSeoMeta({
      title: "Analysis",
      ogTitle: "Analysis",
    });
    const { transactions, budgets } = storeToRefs(useAppStore());
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
      const categoryExpenseMap = new Map<
        TransactionCategory,
        { [month: string]: number }
      >(
        budgets.value.reduce((acc, budget) => {
          acc.set(
            budget.category,
            Object.fromEntries(
              Array.from({ length: 12 }, (_, i) => [
                moment()
                  .subtract(11, "months")
                  .startOf("month")
                  .add(i, "months")
                  .format("MMM YY"),
                0,
              ])
            )
          );
          return acc;
        }, new Map())
      );

      for (const transaction of filteredTransactions) {
        const key = moment(transaction.date).format("MMM YY");

        if (!incomeMap.has(key)) {
          incomeMap.set(key, 0);
          expenseMap.set(key, 0);
        }

        if (transaction.type === TransactionType.CREDIT) {
          incomeMap.set(key, incomeMap.get(key)! + transaction.amount);
        } else if (transaction.type === TransactionType.DEBIT) {
          expenseMap.set(key, expenseMap.get(key)! + transaction.amount);

          const budget = budgets.value.find(
            (b) => b.category === transaction.category
          );
          const { category } = budget || {};
          if (category) {
            const categoryData = categoryExpenseMap.get(category);
            if (categoryData) {
              categoryData[key] = (categoryData[key] || 0) + transaction.amount;
            }
          }
        }
      }

      const categoryExpenses: Record<string, number[]> = {};
      for (const period of last12Months) {
        const key = period.format("MMM YY");
        const income = incomeMap.get(key) || 0;
        const expense = expenseMap.get(key) || 0;

        incomes.push(income);
        expenses.push(-expense);
        differences.push(income - expense);

        for (const [category] of categoryExpenseMap) {
          if (!categoryExpenses[category]) {
            categoryExpenses[category] = [];
          }
        }

        for (const [category, monthData] of categoryExpenseMap) {
          const expense = monthData[key] || 0;
          const categoryData = categoryExpenses[category];
          if (categoryData) {
            categoryData.push(expense);
          }
        }
      }

      return {
        incomeExpense: {
          periods,
          incomes,
          expenses,
          differences,
        },
        categoryExpense: categoryExpenses,
        periods,
      };
    });

    return { chartData };
  },
});
</script>
