<template>
  <div class="grid grid-cols-4 gap-y-4 h-screen">
    <div class="col-span-4 md:col-start-2 md:col-span-2">
      <div class="grid grid-cols-1 gap-2 text-center p-5">
        <div class="mb-5 border-b-[1px] border-base text-left py-5">
          <CommonPageBar mainPage="Finance Genie" />
        </div>
        <div class="mb-5 grid grid-cols-2 justify-items-start">
          <h1 class="text-xl font-bold">Personalized Financial Assistant</h1>
        </div>
        <CommonFormInput
          v-model="prompt"
          title="Ask me anything about your finance:"
          :validation-message="promptErrorMsg"
          @keyup.enter="answerQuestion"
          placeholder="What are the highest/lowest value transactions in the past month?"
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

export default defineComponent({
  async setup() {
    const { budgets, transactions, accounts } = storeToRefs(useAppStore());
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
      const transactionText = transactions.value
        .map((transaction) => {
          return `Transaction: ${transaction.narration} | Amount: ${
            transaction.amount
          } | Type: ${transaction.type} | Category: ${
            transaction.category || "Uncategorized"
          } | Currency: ${transaction.currency}`;
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

      const context = `
        User's Financial Context:
        ${transactionText}

        User's Budgets:
        ${budgetText}

        User's Connected Bank Accounts:
        ${accountText}
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

    const typeCharacter = (string: string) => {
      const textArea = document.getElementById("block");
      if (textArea) {
        textArea.textContent = "";
        typed = new Typed(textArea, {
          strings: [string],
          showCursor: false,
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
