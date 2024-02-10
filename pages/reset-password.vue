<template>
  <img
    v-if="myDid"
    :src="`https://robohash.org/${myDid}`"
    alt="avatar"
    class="w-28 h-28 rounded-xl justify-self-center"
  />
  <h1 class="logo text-4xl">Forgot your password?</h1>
  <p>Enter the verification code sent to your recovery email</p>
  <CommonOtpInput v-model="resetPasswordCode" :fields="6" />
  <p class="cursor-pointer">
    Didn't receive any code in your mailbox?
    <span class="text-blue-600" @click="sendResetPasswordCode"
      >Resend code</span
    >
  </p>
  <CommonFormInput
    inputType="password"
    v-model="password"
    title="type your new password"
    placeholder="password"
    @keyup.enter="resetPassword"
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
import { USER } from "~/services/schemas";

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
    const { findOrUpdateRecord } = useWeb5VueUtils();

    const { myDid, user } = storeToRefs(useAppStore());
    const { setUser } = useAppStore();
    const password = ref("");
    const resetPasswordCode = ref(null);

    onMounted(() => {
      sendResetPasswordCode();
    });

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
      const hashedPassword = await hashPassword(password.value);
      const userRecord = await findOrUpdateRecord(
        {
          ...user.value,
          password: hashedPassword,
        },
        USER
      );
      setUser(userRecord);

      notify({
        type: "success",
        title: "password reset successful",
      });

      navigateTo("/guard");
    };

    const sendResetPasswordCode = async () => {
      const resetPasswordCode = generateRandomDigits();
      const userRecord = await findOrUpdateRecord(
        {
          ...user.value,
          resetPasswordCode,
          resetPasswordCodeExpiresAt: moment().add("hours", 1).toISOString(),
        },
        USER
      );
      setUser(userRecord);

      notify({
        type: "success",
        title: "verification code sent to your recovery email",
      });
    };

    return {
      myDid,
      password,
      resetPassword,
      resetPasswordCode,
      sendResetPasswordCode,
    };
  },
});
</script>
