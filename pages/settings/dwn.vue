<template>
  <div class="grid grid-cols-4 gap-y-4 min-h-screen">
    <div class="col-span-4 md:col-start-2 md:col-span-2">
      <div class="grid grid-cols-1 gap-2 p-5">
        <div class="mb-5 border-b-[1px] border-base text-left py-5">
          <CommonPageBar mainPage="Settings" currentPage="DWN Endpoint" />
        </div>
        <div class="mb-5 text-left">
          <CommonFormInput
            inputType="text"
            v-model="dwnEndpoint"
            title="set your dwn endpoint"
            custom-css="specialfont"
          />
          <CommonButton
            text="Apply"
            @btn-action="applyCustomDwnEndpoint"
            custom-css="!bg-blue-400 w-full"
            :loading="updateDwnEndpointBtnLoading"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { notify } from "@kyvg/vue3-notification";
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    useSeoMeta({
      title: "Settings",
      ogTitle: "Settings",
    });
    const { getCustomDwnEndpoint, setCustomDwnEndpoint, validateDwnEnpoint } =
      useAppVueUtils();
    const dwnEndpoint = ref("");

    const updateDwnEndpointBtnLoading = ref(false);

    onBeforeMount(() => (dwnEndpoint.value = getCustomDwnEndpoint() as string));

    const applyCustomDwnEndpoint = async () => {
      try {
        updateDwnEndpointBtnLoading.value = true;
        const isDwnEnpointValid = await validateDwnEnpoint(dwnEndpoint.value);
        if (!isDwnEnpointValid || !dwnEndpoint.value) {
          notify({
            type: "error",
            title: "dwn url not valid",
          });
          return;
        }
        setCustomDwnEndpoint(dwnEndpoint.value);
        notify({
          type: "success",
          title: "dwn endpoint updated",
        });
        reloadNuxtApp({ path: "" });
      } finally {
        updateDwnEndpointBtnLoading.value = false;
      }
    };
    return {
      dwnEndpoint,
      applyCustomDwnEndpoint,
      updateDwnEndpointBtnLoading,
    };
  },
});
</script>
