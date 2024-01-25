<template>
  <div class="grid grid-cols-4 gap-y-4 min-h-screen">
    <div class="col-span-4 md:col-start-2 md:col-span-2">
      <div class="grid grid-cols-1 gap-2 text-center p-5">
        <div class="mb-5 border-b-[1px] border-base text-left py-5">
          <CommonPageBar mainPage="Chat" />
        </div>

        <CommonFormInput
          v-model="prompt"
          title="Ask me anything about your finance"
          :validation-message="promptErrorMsg"
          @keyup.enter="answerQuestion"
          placeholder="how much did i make last month?"
        />
        <div id="block" class="text-left text-base"></div>
        <span v-show="aiResponseLoading" class="text-left text-base"
          >crunching numbers for your answer... hang tight!</span
        >
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

import Typed from "typed.js";

import { useAppStore } from "~/store";
import { notify } from "@kyvg/vue3-notification";
import moment from "moment";

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
    const { $api } = useNuxtApp();
    const prompt = ref("");
    const promptErrorMsg = ref<string>("");

    const aiResponseLoading = ref(false);

    let typed: Typed;
    watch(prompt, (newVal, prevVal) => {
      !newVal
        ? (promptErrorMsg.value = "your prompt is required")
        : (promptErrorMsg.value = "");
    });

    onBeforeUnmount(() => {
      if (typed) {
        typed.destroy();
      }
    });

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

      const budgetText = budgets.value
        .map((budget) => {
          return `Budget: ${budget.category} | Limit: ${budget.limit} | Currency: ${budget.currency}`;
        })
        .join("\n");

      const accountText = accounts.value
        .map((account) => {
          return `Account: ${account.accountName} | Balance: ${account.balance} | Currency: ${account.currency}`;
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

      const context = `
        Monthly Financial Figures:
        ${monthlyFigures}

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
    };
  },
});
</script>
