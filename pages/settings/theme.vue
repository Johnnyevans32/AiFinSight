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
import { AppThemeEnum, useAppUserConfigStore } from "~/store/config";

export default defineComponent({
  setup() {
    useSeoMeta({
      title: "Settings",
      ogTitle: "Settings",
    });
    const { toggleAppTheme } = useAppUserConfigStore();
    const { appThemeColor } = storeToRefs(useAppUserConfigStore());
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
