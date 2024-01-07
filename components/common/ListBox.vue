<template>
  <select
    v-model="selectedOption"
    class="form-select rounded-xl p-2 border-2 border-base bg-lightbase"
  >
    <option v-for="option in options" :key="option" :value="option">
      {{ option.replaceAll("_", " ") }}
    </option>
  </select>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/vue";

export default defineComponent({
  components: {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
  },
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
