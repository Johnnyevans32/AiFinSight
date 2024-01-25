<template>
  <div class="grid grid-cols-1 justify-items-center py-4">
    <p class="cursor-pointer text-sm font-bold">{{ config.public.appName }}</p>
    <p>{{ config.public.appDesc }}</p>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    const config = useRuntimeConfig();

    return { config };
  },
});
</script>
