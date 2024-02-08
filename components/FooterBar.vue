<template>
  <div class="grid grid-cols-1 justify-items-center py-4">
    <div class="flex items-center gap-2">
      <img :src="`./logo.jpg`" alt="logo" class="w-7 h-7 rounded-xl" />
      <span class="logo">{{ config.public.appName }}</span>
    </div>
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
