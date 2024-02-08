<template>
  <img
    v-if="myDid"
    :src="`https://robohash.org/${myDid}`"
    alt="avatar"
    class="w-28 h-28 rounded-xl justify-self-center"
  />
  <h1 class="logo text-4xl">Forgot your password?</h1>
  <CommonFormInput
    inputType="password"
    v-model="password"
    title="type your new password"
    placeholder="password"
  />
  <CommonButton
    text="Reset"
    @btn-action="resetPassword"
    custom-css="!bg-blue-400 w-full text-black"
  />
  <NuxtLink class="text-blue-600 text-sm" to="/guard"
    >Remember password? Sign In</NuxtLink
  >
</template>

<script lang="ts">
import { notify } from "@kyvg/vue3-notification";
import moment from "moment";

import { useAppStore } from "~/store";

export default defineComponent({
  setup() {
    useSeoMeta({
      title: "Reset Password",
      ogTitle: "Reset Password",
    });

    definePageMeta({
      layout: "guard",
    });
    const config = useRuntimeConfig();
    const { myDid, user } = storeToRefs(useAppStore());
    const { setUser } = useAppStore();
    const password = ref("");
    const resetPasswordCode = ref("");

    const resetPassword = async () => {
      if (
        !user.value.resetPasswordCode ||
        !user.value.resetPasswordCodeExpiresAt
      ) {
        notify({
          type: "error",
          title: "reset password code not set",
        });
        return;
      }
      if (
        resetPasswordCode.value !== user.value.resetPasswordCode ||
        moment().isAfter(moment(user.value.resetPasswordCodeExpiresAt))
      ) {
        notify({
          type: "error",
          title: "reset password code invalid",
        });
        return;
      }
      setUser({
        ...user.value,
        password: password.value,
      });

      notify({
        type: "success",
        title: "password reset successful",
      });

      navigateTo("/guard");
    };

    const sendResetPasswordCode = () => {
      setUser({
        ...user.value,
        resetPasswordCode: generateRandomDigits(),
        resetPasswordCodeExpiresAt: moment().add("hours", 1).toISOString(),
      });
    };

    return {
      myDid,
      password,
      resetPassword,
    };
  },
});
</script>
