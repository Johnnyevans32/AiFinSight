<template>
  <div class="border-b-[1px] border-base text-left py-5">
    <CommonPageBar mainPage="Settings" currentPage="Currency" />
  </div>
  <div class="text-left">
    <CommonRadioCheckInput
      :selected="currency"
      :options="Object.values(Currency)"
      name="currencies"
      @change-option="handleCurrencyChange"
    />
  </div>
</template>

<script lang="ts">
import { Currency } from "~/types/mono";
import { defineComponent } from "vue";

import { useAppStore } from "~/store";

export default defineComponent({
  setup() {
    useSeoMeta({
      title: "Settings",
      ogTitle: "Settings",
    });
    const { setCurrency } = useAppStore();
    const { currency } = storeToRefs(useAppStore());
    const handleCurrencyChange = (newVal: string) => {
      setCurrency(newVal as Currency);
    };

    return {
      currency,
      Currency,
      handleCurrencyChange,
    };
  },
});
</script>
