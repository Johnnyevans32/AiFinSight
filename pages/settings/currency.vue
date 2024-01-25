<template>
  <div class="grid grid-cols-4 gap-y-4 min-h-screen">
    <div class="col-span-4 md:col-start-2 md:col-span-2">
      <div class="grid grid-cols-1 gap-2 p-5">
        <div class="mb-5 border-b-[1px] border-base text-left py-5">
          <CommonPageBar mainPage="Settings" currentPage="Currency" />
        </div>
        <div class="mb-5 text-left">
          <CommonRadioCheckInput
            :selected="currency"
            :options="Object.values(Currency)"
            name="currencies"
            @change-option="handleCurrencyChange"
          />
        </div>
      </div>
    </div>
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
