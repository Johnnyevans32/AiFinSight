<template>
  <div class="grid grid-cols-4 gap-y-4 h-screen">
    <div class="col-span-4 md:col-start-2 md:col-span-2">
      <div class="grid grid-cols-1 gap-2 text-center p-5">
        <div class="mb-5 border-b-[1px] border-base text-left py-5">
          <CommonPageBar mainPage="Ask Ai" />
        </div>
        <div class="mb-5 grid grid-cols-2 justify-items-start">
          <h1 class="text-xl font-bold">Your Personal Ai Finance Manager</h1>
        </div>
        <CommonFormInput
          v-model="prompt"
          title="Ask me anything about your finance:"
          :validation-message="promptErrorMsg"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  async setup() {
    const prompt = ref("");
    const promptErrorMsg = ref<string>("");

    watch(prompt, (newVal, prevVal) => {
      !newVal
        ? (promptErrorMsg.value = "your prompt is required")
        : (promptErrorMsg.value = "");
    });

    return { prompt, promptErrorMsg };
  },
});
</script>
