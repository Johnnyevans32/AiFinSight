<template>
  <div>
    <span v-show="title" class="text-sm"> {{ title }}:</span>
    <div class="flex items-center">
      <span
        class="bg-lightbase rounded-lg pl-5 pr-2 py-2 border-[1px] border-r-0 border-base rounded-r-none"
        >{{ currencySignMap[currency] }}</span
      >
      <CommonFormInput
        v-model="amount"
        inputType="number"
        class="w-full"
        custom-css="pl-0 border-l-0 rounded-l-none"
        :placeholder="placeholder"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { useAppUserConfigStore } from "~/store/config";
import { defineComponent } from "vue";
import { currencySignMap } from "~/types/accounts";

export default defineComponent({
  props: {
    title: { type: String, required: false },
    modelValue: {},
    placeholder: { type: String, required: false },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    const amount = ref(1000);
    const { currency } = storeToRefs(useAppUserConfigStore());

    watch(amount, () => {
      handleModelValueChangeAction();
    });

    const handleModelValueChangeAction = () =>
      ctx.emit("update:modelValue", Number(amount.value));
    return { handleModelValueChangeAction, currency, currencySignMap, amount };
  },
});
</script>
