<template>
  <div
    class="flex justify-between w-full p-5 rounded-xl border-[1px] bg-lightbase border-base"
  >
    <div class="flex flex-col justify-between items-start">
      <span class="md:text-sm text-xs">{{ label }}</span>
      <h2 class="md:text-xl text-sm">{{ currency }}{{ value }}</h2>
    </div>

    <div class="flex flex-col justify-between items-end">
      <chart-income-expense-trend
        :data="data"
        :periods="periods"
        class="md:block hidden"
        :label="label"
      />
      <div class="md:self-end self-start text-xs flex items-center gap-1">
        <span
          :class="differenceClass"
          class="px-2 rounded-xl flex items-center gap-1"
        >
          <font-awesome-icon
            :icon="differenceIcon"
            :class="trendIconClass"
            class="md:text-sm text-tiny"
          />
          {{ Math.abs(difference) }}%
        </span>
        <p class="md:flex hidden">vs previous month</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    icon: String,
    value: String,
    difference: {
      type: Number,
      default: 0,
    },
    label: {
      type: String,
      required: true,
    },
    currency: String,
    data: {
      type: Array<Number>,
      default: [],
    },
    periods: {
      type: Array<String>,
      default: [],
    },
  },
  async setup(props) {
    const differenceIcon = computed(() => {
      return props.difference < 0 ? "arrow-trend-down" : "arrow-trend-up";
    });
    const differenceClass = computed(() => {
      return {
        "text-red-600 bg-red-200": props.difference < 0,
        "text-green-600 bg-green-200": props.difference >= 0,
      };
    });
    const trendIconClass = computed(() => {
      return props.difference < 0 ? "text-red-600" : "text-green-600";
    });
    const labelIconClass = computed(() => {
      return props.label?.includes("Expense")
        ? "text-red-600"
        : "text-green-600";
    });

    return { differenceIcon, differenceClass, trendIconClass, labelIconClass };
  },
});
</script>
