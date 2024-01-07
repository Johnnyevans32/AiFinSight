<template>
  <div
    class="flex justify-between items-center md:w-72 p-5 rounded-3xl border-2 border-b-8 bg-lightbase border-base"
  >
    <div class="flex flex-col items-start gap-5">
      <font-awesome-icon :icon="icon" :class="labelIconClass" />
      <div class="flex flex-col items-start">
        <span class="text-tiny">{{ label }}</span>
        <h2 class="text-xl">{{ currency }}{{ value }}</h2>
      </div>
    </div>
    <span :class="differenceClass" class="text-tiny self-end">
      <font-awesome-icon :icon="differenceIcon" :class="trendIconClass" />
      {{ Math.abs(difference) }}% from last month.
    </span>
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
    label: String,
    currency: String,
  },
  async setup(props) {
    const differenceIcon = computed(() => {
      return props.difference < 0
        ? "fa-solid fa-arrow-down"
        : "fa-solid fa-arrow-up";
    });
    const differenceClass = computed(() => {
      return {
        "text-red-400": props.difference < 0,
        "text-green-400": props.difference >= 0,
      };
    });
    const trendIconClass = computed(() => {
      return props.difference < 0 ? "text-red-400" : "text-green-400";
    });
    const labelIconClass = computed(() => {
      return props.label?.includes("expense")
        ? "text-red-400"
        : "text-green-400";
    });

    return { differenceIcon, differenceClass, trendIconClass, labelIconClass };
  },
});
</script>
