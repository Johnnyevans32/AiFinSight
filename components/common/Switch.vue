<template>
  <Switch
    v-model="enabled"
    :class="selected ? 'bg-base' : 'bg-lightbase'"
    class="flex p-1 w-14 h-7 items-center rounded-xl"
  >
    <span class="sr-only">Enable notifications</span>
    <span
      :class="selected ? 'translate-x-4' : 'translate-x-0'"
      class="h-5 w-5 transform rounded-xl bg-bgbase transition"
    ></span>
  </Switch>
</template>

<script lang="ts">
import { Switch } from "@headlessui/vue";

export default defineComponent({
  components: {
    Switch,
  },
  emits: ["changeOption"],
  props: {
    selected: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, ctx) {
    const enabled = ref(props.selected);

    watch(enabled, (newVal) => {
      ctx.emit("changeOption", newVal);
    });

    return {
      enabled,
    };
  },
});
</script>
