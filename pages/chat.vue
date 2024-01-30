<template>
  <div class="border-b-[1px] border-base text-left py-5">
    <CommonPageBar mainPage="Chat" />
  </div>

  <div class="grid grid-cols-2 md:grid-cols-2 gap-2">
    <div
      v-for="(promptItem, index) in suggestedPrompts"
      :key="index"
      class="prompt flex justify-between items-center h-16 py-2 px-5 rounded-xl bg-bgbase border-[1px] border-base cursor-pointer hover:bg-lightbase"
      @mouseover="hoveredIndex = index"
      @mouseout="hoveredIndex = null"
      @click="
        () => {
          prompt = `${promptItem.title} ${promptItem.others}`;
          answerQuestion();
        }
      "
    >
      <div class="text-left text-sm">
        <p class="font-extrabold">
          {{ promptItem.title }}
        </p>
        <p>{{ promptItem.others }}</p>
      </div>
      <font-awesome-icon
        v-show="hoveredIndex === index"
        icon="arrow-up"
        class="bg-bgbase rounded-lg h-5 w-5 p-1"
      />
    </div>
  </div>
  <CommonFormInput
    v-model="prompt"
    :validation-message="promptErrorMsg"
    @keyup.enter="answerQuestion"
    placeholder="Ask me anything about your finance"
  />
  <div id="block" class="text-left text-base"></div>
  <span v-show="aiResponseLoading" class="text-left text-base"
    >crunching numbers for your answer... hang tight!</span
  >
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { notify } from "@kyvg/vue3-notification";
import moment from "moment";
import Typed from "typed.js";

import { useAppStore } from "~/store";
import { BudgetDTO } from "~/types/accounts";
import { TransactionType, TransactionCategory } from "~/types/mono";

interface MonthlyTransaction {
  income: number;
  expenses: number;
  differences: number;
}

export default defineComponent({
  async setup() {
    useSeoMeta({
      title: "Chat",
      ogTitle: "Chat",
    });

    const { budgets, transactions, accounts, assets } = storeToRefs(
      useAppStore()
    );

    const hoveredIndex = ref<null | number>(null);
    const suggestedPrompts = ref([
      { title: "whats my", others: "income for last month" },
      { title: "whats my", others: "income for last month" },
      { title: "whats my", others: "income for last month" },
      { title: "whats my", others: "income for last month" },
    ]);

    const { $api } = useNuxtApp();
    const prompt = ref("");
    watch(prompt, (newVal, prevVal) => {
      !newVal
        ? (promptErrorMsg.value = "your prompt is required")
        : (promptErrorMsg.value = "");
    });
    const promptErrorMsg = ref<string>("");

    const aiResponseLoading = ref(false);

    let typed: Typed;
    onBeforeUnmount(() => {
      if (typed) {
        typed.destroy();
      }
    });

    const startOfMonth = ref(moment().startOf("month"));

    const endOfMonth = ref(moment().endOf("month"));

    const userFinanceContext = computed(() => {
      if (!transactions.value.length) {
        return "";
      }
      const monthlyTransactions: Record<string, MonthlyTransaction> =
        transactions.value.reduce((acc, transaction) => {
          const transactionDate = moment(transaction.date);
          const monthYear = transactionDate.format("MMMM YYYY");

          if (!acc[monthYear]) {
            acc[monthYear] = {
              income: 0,
              expenses: 0,
              differences: 0,
            };
          }

          if (transaction.type === "credit") {
            acc[monthYear].income += transaction.amount;
          } else if (transaction.type === "debit") {
            acc[monthYear].expenses += transaction.amount;
          }

          acc[monthYear].differences =
            acc[monthYear].income - acc[monthYear].expenses;

          return acc;
        }, {} as Record<string, MonthlyTransaction>);

      const monthlyFigures = Object.entries(monthlyTransactions)
        .map(([monthYear, data]) => {
          return `Month and Year: ${monthYear} | Credits: ${data.income} | Debits: ${data.expenses}`;
        })
        .join("\n");

      const transactionText = transactions.value
        .map((transaction) => {
          return `Transaction: ${transaction.narration} | Amount: ${
            transaction.amount
          } | Type: ${transaction.type} | Category: ${
            transaction.category || "Uncategorized"
          } | Currency: ${
            transaction.currency
          } | Account Balance After Transaction | ${
            transaction.balance
          } |  Account Id: ${transaction.accountId} |  Date: ${
            transaction.date
          } `;
        })
        .join("\n");

      const transactionsForPeriod = transactions.value.filter(
        (transaction) =>
          moment(transaction.date).isBetween(
            startOfMonth.value,
            endOfMonth.value,
            undefined,
            "[]"
          ) &&
          transaction.type === TransactionType.DEBIT &&
          !!transaction.category
      );
      const budgetsGroupedByCategory: Record<
        TransactionCategory,
        BudgetDTO & { amountSpentOnCategoryBudget?: number }
      > = groupBy(budgets.value, "category");

      transactionsForPeriod.forEach((transaction) => {
        const { category, amount, currency } = transaction;
        if (
          category &&
          budgetsGroupedByCategory[category] &&
          budgetsGroupedByCategory[category].currency === currency
        ) {
          const amountSpentOnCategoryBudget =
            (budgetsGroupedByCategory[category].amountSpentOnCategoryBudget ||
              0) + amount;

          budgetsGroupedByCategory[category] = {
            ...budgetsGroupedByCategory[category],
            amountSpentOnCategoryBudget,
          };
        }
      });

      const budgetText = Object.values(budgetsGroupedByCategory)
        .map((budget) => {
          return `Budget: ${budget.category} | Limit: ${
            budget.limit
          } | Amount Spent: ${budget.amountSpentOnCategoryBudget} | Currency: ${
            budget.currency
          } | Period: From ${startOfMonth.value.format(
            "MMMM Do"
          )} to ${endOfMonth.value.format("MMMM Do")}`;
        })
        .join("\n");

      const accountText = accounts.value
        .map((account) => {
          return `Account: ${account.accountName} | Balance: ${account.balance} | Currency: ${account.currency} | Bank Name: ${account.bankName}`;
        })
        .join("\n");

      const assetText = assets.value
        .map((asset) => {
          return `Asset Name: ${asset.name} | type of asset: ${
            asset.type || asset.meta.type
          } | purchase price of asset: ${asset.price} | Currency: ${
            asset.currency
          } | Cost incurred on purchasing the asset: ${
            asset.cost
          } | quantity of asset owned: ${
            asset.quantity
          } | unrealized amount gained by the user: ${asset.return}`;
        })
        .join("\n");

      // Monthly Financial Figures:
      // ${monthlyFigures}

      const context = `
        User's Transactions:
        ${transactionText}

        User's Budgets:
        ${budgetText}

        User's Connected Bank Accounts:
        ${accountText}

        User's Assets & Investments:
        ${assetText}
      `;

      return context;
    });

    const answerQuestion = async () => {
      try {
        if (aiResponseLoading.value) {
          return;
        }
        aiResponseLoading.value = true;
        if (!userFinanceContext.value) {
          notify({
            type: "error",
            title: "context not available",
          });
          return;
        }

        if (!prompt.value) {
          notify({
            type: "error",
            title: "prompt not available",
          });
          return;
        }

        const response = await $api.accountService.queryContextualGpt(
          userFinanceContext.value,
          prompt.value
        );
        aiResponseLoading.value = false;

        typeCharacter(response);
      } catch (error) {
        notify({
          type: "error",
          title: "try again, an error occured",
        });
      } finally {
        aiResponseLoading.value = false;
      }
    };

    const typeCharacter = (string: string, loop = false) => {
      const textArea = document.getElementById("block");
      if (textArea) {
        textArea.textContent = "";
        typed = new Typed(textArea, {
          strings: [string],
          showCursor: false,
          loop,
        });
      }
    };

    return {
      prompt,
      promptErrorMsg,
      answerQuestion,
      aiResponseLoading,
      typeCharacter,
      suggestedPrompts,
      hoveredIndex,
    };
  },
});
</script>

<style>
.prompt:hover font-awesome-icon {
  display: block;
  color: blue;
}
</style>
