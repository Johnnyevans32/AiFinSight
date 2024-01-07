<template>
  <div class="grid grid-cols-4 gap-y-4 h-screen">
    <div class="col-span-4 md:col-start-2 md:col-span-2">
      <div class="grid grid-cols-1 gap-2 text-center p-5">
        <div class="mb-5 border-b-2 border-base text-left py-5">
          <CommonPageBar mainPage="Settings" currentPage="Theme" />
        </div>
        <div class="mb-5">
          <h1 class="text-xl font-bold text-center">Themes</h1>
        </div>
        <div class="mb-5 text-left">
          <CommonRadioCheckInput
            :selected="appThemeColor"
            :options="themes"
            name="app theme"
            @change-option="handleThemeOptionChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { AppThemeEnum, useAppStore } from "~/store";

export default defineComponent({
  setup() {
    const { toggleAppTheme } = useAppStore();
    const { appThemeColor } = storeToRefs(useAppStore());
    const themes = ref(Object.values(AppThemeEnum));
    const handleThemeOptionChange = (newVal: string) => {
      toggleAppTheme(newVal);
    };

    return {
      themes,
      appThemeColor,
      handleThemeOptionChange,
    };
  },
});
</script>
