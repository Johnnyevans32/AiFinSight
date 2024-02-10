<template>
  <img
    v-if="myDid"
    :src="`https://robohash.org/${myDid}`"
    alt="avatar"
    class="w-28 h-28 rounded-xl justify-self-center"
  />
  <h1 class="logo text-4xl">Welcome Back!</h1>
  <h1 class="logo text-4xl">{{ truncateString(myDid) }}</h1>
  <CommonFormInput
    inputType="password"
    v-model="password"
    title="enter your password"
    placeholder="password"
    @keyup.enter="unlock"
  />
  <CommonButton
    text="Unlock"
    @btn-action="unlock"
    custom-css="!bg-blue-400 w-full text-black"
  />
  <NuxtLink class="text-blue-600 text-sm" to="/reset-password"
    >Forgot password?</NuxtLink
  >
  <p class="text-sm">
    Need help?
    <a
      class="text-blue-600 cursor-pointer"
      :href="generateMailToLink()"
      target="_blank"
      >Contact {{ config.public.appName }} support</a
    >
  </p>
</template>

<script lang="ts">
import { notify } from "@kyvg/vue3-notification";

import { useAppStore } from "~/store";

export default defineComponent({
  setup() {
    useSeoMeta({
      title: "Guard",
      ogTitle: "Guard",
    });

    definePageMeta({
      layout: "guard",
    });
    const config = useRuntimeConfig();
    const route = useRoute();
    const { myDid, user } = storeToRefs(useAppStore());
    const { setAppLocked } = useAppStore();
    const password = ref("");

    const unlock = async () => {
      if (!user.value.password) {
        return handleUnlockSuccess();
      }

      const passwordMatched = await verifyPassword(
        password.value,
        user.value.password
      );

      if (passwordMatched) {
        return handleUnlockSuccess();
      }

      notify({
        type: "error",
        title: "Invalid password",
      });
    };

    const handleUnlockSuccess = async () => {
      setAppLocked(false);
      await navigateTo((route.query.redirect as string) || "/");
      notify({
        type: "success",
        title: "Successfully logged in",
      });
    };

    return {
      myDid,
      password,
      unlock,
      config,
    };
  },
});
</script>
