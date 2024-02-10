<template>
  <div class="border-b-[1px] border-base text-left py-5">
    <CommonPageBar mainPage="Settings" currentPage="DWN Endpoint" />
  </div>
  <div class="flex flex-col gap-4 text-left">
    <CommonFormInput
      inputType="text"
      v-model="customDwnEndpoint"
      title="set your dwn endpoint"
      custom-css="specialfont"
    />
    <CommonButton
      text="Apply"
      @btn-action="applyCustomDwnEndpoint"
      custom-css="!bg-blue-400 w-full text-black"
      :loading="updateDwnEndpointBtnLoading"
    />
  </div>
</template>

<script lang="ts">
import { notify } from "@kyvg/vue3-notification";

import { useAppUserConfigStore } from "~/store/config";
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    useSeoMeta({
      title: "Settings",
      ogTitle: "Settings",
    });
    const { validateDwnEnpoint } = useWeb5VueUtils();
    const { setDwnEndpoint } = useAppUserConfigStore();
    const { dwnEndpoint } = storeToRefs(useAppUserConfigStore());
    const customDwnEndpoint = ref(dwnEndpoint.value);

    const updateDwnEndpointBtnLoading = ref(false);

    const applyCustomDwnEndpoint = async () => {
      try {
        updateDwnEndpointBtnLoading.value = true;
        const isDwnEnpointValid = await validateDwnEnpoint(
          customDwnEndpoint.value
        );
        if (!isDwnEnpointValid || !customDwnEndpoint.value) {
          notify({
            type: "error",
            title: "dwn url not valid",
          });
          return;
        }
        setDwnEndpoint(customDwnEndpoint.value);
        notify({
          type: "success",
          title: "dwn endpoint updated",
        });
        reloadNuxtApp({ path: "/" });
      } finally {
        updateDwnEndpointBtnLoading.value = false;
      }
    };
    return {
      customDwnEndpoint,
      applyCustomDwnEndpoint,
      updateDwnEndpointBtnLoading,
    };
  },
});
</script>
