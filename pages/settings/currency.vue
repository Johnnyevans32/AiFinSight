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
import { Currency } from "~/types/accounts";
import { defineComponent } from "vue";

import { useAppUserConfigStore } from "~/store/config";

export default defineComponent({
  setup() {
    useSeoMeta({
      title: "Settings",
      ogTitle: "Settings",
    });
    const { setCurrency } = useAppUserConfigStore();
    const { currency } = storeToRefs(useAppUserConfigStore());
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
