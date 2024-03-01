<template>
  <Loading />
  <div class="min-h-screen">
    <Navbar />
    <div class="grid grid-cols-4 gap-y-4">
      <div class="col-span-4 md:col-start-2 md:col-span-2">
        <div class="grid grid-cols-1 gap-4 p-5 text-center">
          <slot />
        </div>
      </div>
    </div>
  </div>
  <v-idle
    v-show="false"
    v-if="user.isGuardScreenEnabled"
    @idle="onidle"
    @remind="onremind"
    :loop="true"
    :reminders="[10, 15]"
    :wait="5"
    :duration="durationOfScreenLockUntilLockInMins * 60"
  />
</template>

<script lang="ts">
import { notify } from "@kyvg/vue3-notification";
import { useAppUserConfigStore } from "~/store/config";
import { useAppStore } from "~/store";
export default defineComponent({
  setup() {
    const route = useRoute();
    const { user } = storeToRefs(useAppStore());
    const { setAppLocked } = useAppStore();
    const { durationOfScreenLockUntilLockInMins } = storeToRefs(
      useAppUserConfigStore()
    );
    const onidle = async () => {
      setAppLocked(true);
      await navigateTo(`/guard?redirect=${route.fullPath}`);
      notify({
        type: "info",
        title: "You have been locked out",
      });
    };

    const onremind = (time: number) => {
      notify({
        type: "info",
        title: `We care about your security! To ensure the safety of your account, you will be automatically locked out if there is no activity detected for ${time} seconds. Please stay active to avoid being locked out.`,
      });
    };
    return { onremind, onidle, user, durationOfScreenLockUntilLockInMins };
  },
});
</script>
