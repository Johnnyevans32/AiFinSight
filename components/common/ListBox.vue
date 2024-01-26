<template>
  <select
    v-model="selectedOption"
    class="rounded-xl p-2 border-[1px] border-base bg-lightbase"
  >
    <option v-for="option in options" :key="option" :value="option">
      {{ option.replaceAll("_", " ") }}
    </option>
  </select>
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
