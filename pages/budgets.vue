<template>
  <div class="border-b-[1px] border-base text-left py-5">
    <CommonPageBar mainPage="Budgets" />
  </div>
  <div class="flex items-center justify-between">
    <h1 class="text-xl font-bold">Budgets</h1>
    <CommonButton
      text="Create Budget"
      @btn-action="createBudgetModal = true"
      custom-css="justify-self-end"
    />
  </div>
  <div
    class="flex flex-col gap-2 px-5 py-3 rounded-xl border-[1px] bg-lightbase border-base"
  >
    <div class="flex justify-between">
      <div class="flex flex-col text-left">
        <span>Total Amount Spent</span>
        <span class="text-sm capitalize text-red-600"
          >{{ currencySignMap[currency] }}
          {{ formatMoney(formattedBudgets.overall.spent) }}</span
        >
      </div>

      <p>{{ budgetPeriod }}</p>
      <div class="flex flex-col text-right">
        <span>Total Budget Limit</span>
        <span class="text-sm capitalize"
          >{{ currencySignMap[currency] }}
          {{ formatMoney(formattedBudgets.overall.limit) }}
        </span>
      </div>
    </div>
    <CommonProgressBar
      :percentage="
        (formattedBudgets.overall.spent / formattedBudgets.overall.limit) * 100
      "
    />
  </div>

  <div v-if="recordIsInPullingState[BUDGETS]">
    <div
      v-for="i in 2"
      :key="i"
      class="px-5 py-2 cursor-progress flex space-x-3 mb-2 items-center rounded-xl text-base bg-lightbase border-[1px] border-base animate-pulse"
    >
      <div class="bg-base h-10 w-10 rounded-xl"></div>

      <div class="flex flex-col w-full gap-2">
        <div class="h-2 w-20 bg-base rounded"></div>
        <div class="h-2 w-full bg-base rounded"></div>
        <div class="flex justify-between">
          <div class="h-2 w-20 bg-base rounded"></div>
          <div class="h-2 w-28 bg-base rounded"></div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="!budgets.length" class="text-center">
    <font-awesome-icon
      class="text-7xl mb-5"
      icon="fa-solid fa-hand-holding-usd"
    />
    <p>Nothing to see here</p>
    <p>
      Start tracking your expenses by creating budgets based on your
      transactions.
    </p>
  </div>
  <div v-else class="flex flex-col gap-2">
    <div
      v-for="budget in Object.values(formattedBudgets.budgetsGroupedByCategory)"
      :key="budget.recordId"
      @click="viewSingleBudget(budget)"
      class="cursor-pointer px-5 py-2 flex space-x-3 items-center rounded-xl text-base bg-lightbase border-[1px] border-base"
    >
      <font-awesome-icon
        :icon="generateIconMap(budget.category)"
        class="h-10 w-10 rounded-xl text-2xl"
      />

      <div class="flex flex-col w-full gap-1 text-left">
        <span class="capitalize font-bold">{{
          budget.category.replaceAll("_", " ")
        }}</span>
        <CommonProgressBar
          :percentage="
            ((budget.amountSpentOnCategoryBudget || 0) / budget.limit) * 100
          "
        />
        <div class="flex justify-between">
          <span class="text-sm"
            >{{ budget.currencySign }}
            {{ formatMoney(budget.limit) }} limit</span
          >
          <span
            class="text-sm"
            :class="
              budget.limit - (budget.amountSpentOnCategoryBudget || 0) < 0 &&
              'text-red-600'
            "
            >{{ budget.currencySign }}
            {{
              formatMoney(
                budget.limit - (budget.amountSpentOnCategoryBudget || 0)
              )
            }}
            left</span
          >
        </div>
      </div>
    </div>
  </div>

  <CommonModal
    :open="createBudgetModal"
    title="Create budget"
    @change-modal-status="changeModalStatus"
  >
    <template v-slot:content>
      <div class="flex flex-col gap-4">
        <CommonFormInput
          v-model="limitModel"
          inputType="number"
          placeholder="0"
          title="limit"
        />
        <CommonFormSelect
          :selected="categoryModel"
          :options="Object.values(TransactionCategory)"
          @change-option="handleBudgetCategoryChange"
        />
      </div>
    </template>
    <template v-slot:footer>
      <CommonButton
        text="Cancel"
        @btn-action="createBudgetModal = false"
        custom-css="bg-red-400 w-full text-black"
      />
      <CommonButton
        text="Create"
        @btn-action="createBudget"
        custom-css="!bg-blue-400 w-full text-black"
        :loading="createBudgetBtnLoading"
      />
    </template>
  </CommonModal>
  <CommonModal
    :open="updateBudgetModal"
    title="Update budget"
    @change-modal-status="changeModalStatus"
  >
    <template v-slot:content>
      <div class="flex flex-col gap-4">
        <CommonFormInput
          v-if="modalBudget?.limit"
          v-model="modalBudget.limit"
          inputType="number"
          placeholder="0"
          title="limit"
        />
        <CommonFormSelect
          :selected="modalBudget?.category"
          :options="Object.values(TransactionCategory)"
          @change-option="handleBudgetCategoryUpdateChange"
        />
      </div>
    </template>
    <template v-slot:footer>
      <CommonButton
        text="Delete Budget"
        @btn-action="deleteBudget"
        custom-css="bg-red-400 w-full text-black"
      />
      <CommonButton
        text="Update Budget"
        @btn-action="updateBudget"
        custom-css="!bg-blue-400 w-full text-black"
        :loading="updateBudgetBtnLoading"
      />
    </template>
  </CommonModal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import moment from "moment";
import { notify } from "@kyvg/vue3-notification";

import { BUDGETS } from "~/services/schemas";
import { useAppStore } from "~/store";
import {
  type BudgetDTO,
  currencySignMap,
  TransactionCategory,
  TransactionType,
  Currency,
} from "~/types/accounts";
import { useAppUserConfigStore } from "~/store/config";

export default defineComponent({
  async setup() {
    useSeoMeta({
      title: "Budgets",
      ogTitle: "Budgets",
    });
    const { findRecords, createRecord, updateRecord, deleteRecord } =
      useWeb5VueUtils();

    const limitModel = ref<number>(1000);
    const categoryModel = ref<TransactionCategory>(TransactionCategory.FOOD);
    const createBudgetBtnLoading = ref(false);

    const updateBudgetModal = ref(false);
    const updateBudgetBtnLoading = ref(false);
    const modalBudget = ref<BudgetDTO | null>(null);

    const createBudgetModal = ref(false);
    const { budgets, transactions, recordIsInPullingState } = storeToRefs(
      useAppStore()
    );
    const { currency } = storeToRefs(useAppUserConfigStore());
    const { setBudgets, updateRecordPullingStatus } = useAppStore();
    const startOfMonth = ref(moment().startOf("month"));

    const endOfMonth = ref(moment().endOf("month"));
    const budgetPeriod = computed(() => {
      return startOfMonth.value.format("MMMM YYYY");
    });

    const formattedBudgets = computed(() => {
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

      const overall = Object.values(budgetsGroupedByCategory).reduce(
        (acc, curr) => {
          return {
            limit: acc.limit + (curr.limit || 0),
            spent: acc.spent + (curr.amountSpentOnCategoryBudget || 0),
          };
        },
        {
          limit: 0,
          spent: 0,
        }
      );

      return { budgetsGroupedByCategory, overall };
    });

    onBeforeMount(async () => {
      try {
        updateRecordPullingStatus(BUDGETS, true);
        const [dbBudgets] = await Promise.all([
          findRecords<BudgetDTO[]>(BUDGETS),
        ]);
        setBudgets(dbBudgets);
      } catch (err) {
        console.log("before mount error", { err });
      } finally {
        updateRecordPullingStatus(BUDGETS, false);
      }
    });

    const changeModalStatus = (newVal: boolean) => {
      createBudgetModal.value = newVal;
      updateBudgetModal.value = newVal;
    };

    const createBudget = async () => {
      try {
        createBudgetBtnLoading.value = true;
        if (
          formattedBudgets.value.budgetsGroupedByCategory[categoryModel.value]
        ) {
          notify({
            type: "error",
            title: "budget already exist",
          });
          return;
        }
        const data = {
          limit: limitModel.value,
          category: categoryModel.value,
          currency: currency.value,
          currencySign: currencySignMap[currency.value],
        };
        const createdData = await createRecord<BudgetDTO>(data, BUDGETS);
        if (!createdData) {
          notify({
            type: "error",
            title: "error creating budget",
          });
          return;
        }
        setBudgets([createdData, ...budgets.value]);
      } finally {
        createBudgetBtnLoading.value = false;
        createBudgetModal.value = false;
      }
    };

    const handleBudgetCategoryChange = (newVal: string) => {
      categoryModel.value = newVal as TransactionCategory;
    };

    const updateBudget = () => {
      try {
        if (modalBudget.value && modalBudget.value.recordId) {
          updateRecord(modalBudget.value.recordId, modalBudget.value, BUDGETS);

          const updatedBudgets = budgets.value.map((budget) =>
            budget.recordId === modalBudget.value?.recordId
              ? { ...budget, ...modalBudget.value }
              : budget
          );
          setBudgets(updatedBudgets);

          notify({
            type: "success",
            title: "budget updated",
          });
        }
      } finally {
        updateBudgetModal.value = false;
      }
    };

    const deleteBudget = () => {
      try {
        if (modalBudget.value && modalBudget.value.recordId) {
          deleteRecord(modalBudget.value.recordId, BUDGETS);

          const updatedBudgets = budgets.value.filter(
            (budget) => budget.recordId !== modalBudget.value?.recordId
          );

          setBudgets(updatedBudgets);

          notify({
            type: "success",
            title: "budget deleted",
          });
        }
      } finally {
        updateBudgetModal.value = false;
      }
    };

    const handleBudgetCategoryUpdateChange = (newVal: string) => {
      if (modalBudget.value) {
        modalBudget.value.category = newVal as TransactionCategory;
      }
    };

    const viewSingleBudget = (budget: BudgetDTO) => {
      delete budget.amountSpentOnCategoryBudget;
      modalBudget.value = budget;
      updateBudgetModal.value = true;
    };
    return {
      TransactionType,
      budgets,
      budgetPeriod,
      formattedBudgets,
      currencySignMap,
      Currency,
      createBudget,
      createBudgetModal,
      changeModalStatus,
      limitModel,
      categoryModel,
      TransactionCategory,
      handleBudgetCategoryChange,
      createBudgetBtnLoading,
      updateBudgetModal,
      updateBudgetBtnLoading,
      modalBudget,
      updateBudget,
      deleteBudget,
      viewSingleBudget,
      handleBudgetCategoryUpdateChange,
      recordIsInPullingState,
      BUDGETS,
      currency,
    };
  },
});
</script>
