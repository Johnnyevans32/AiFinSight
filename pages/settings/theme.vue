<template>
  <div class="border-b-[1px] border-base text-left py-5">
    <CommonPageBar mainPage="Settings" currentPage="Theme" />
  </div>
  <div class="text-left">
    <CommonRadioCheckInput
      :selected="appThemeColor"
      :options="themes"
      name="app theme"
      @change-option="handleThemeOptionChange"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { AppThemeEnum, useAppStore } from "~/store";

export default defineComponent({
  setup() {
    useSeoMeta({
      title: "Settings",
      ogTitle: "Settings",
    });
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
