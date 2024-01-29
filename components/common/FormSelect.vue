<template>
  <div class="flex justify-end items-center">
    <select
      v-model="selectedOption"
      class="rounded-xl border-[1px] border-base bg-lightbase text-base pl-5 pr-8 py-2 w-full cursor-pointer appearance-none"
    >
      <option v-for="option in options" :key="option" :value="option">
        {{ option.replaceAll("_", " ") }}
      </option>
    </select>
    <font-awesome-icon icon="caret-down" class="absolute mr-5" />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  emits: ["changeOption"],
  props: {
    options: {
      type: Array as PropType<string[]>,
      default: [],
    },
    selected: {
      type: String,
    },
  },
  setup(props, ctx) {
    const selectedOption = ref(props.selected);

    watch(selectedOption, (newVal, prevVal) => {
      ctx.emit("changeOption", newVal);
    });

    return {
      selectedOption,
    };
  },
});
</script>
