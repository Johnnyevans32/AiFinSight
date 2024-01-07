<template>
  <div class="container-fluid px-2 min-h-screen w-full">
    <div
      class="flex items-center border-t-0 border-base text-center justify-center mx-auto"
    >
      <div class="flex flex-col">
        <a href="#" class="cursor-pointer text-sm ml-2 font-bold">{{
          config.public.appName
        }}</a>
        <p>{{ config.public.appDesc }}</p>
      </div>
    </div>
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
