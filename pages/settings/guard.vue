<template>
  <div class="border-b-[1px] border-base text-left py-5">
    <CommonPageBar mainPage="Settings" currentPage="Guard" />
  </div>
  <div class="flex justify-between items-start">
    <div class="text-left">
      <p class="font-bold">Enable Guard Screen</p>
      <p class="text-sm">
        Enable guard screen to protect your account from unauthorized access.
        You will need to enter your password after a period of inactivity.
      </p>
    </div>
    <div class="w-40 flex justify-end">
      <CommonSwitch
        @change-option="handleEnableLockScreenSwitchChange"
        :selected="user.isGuardScreenEnabled"
      />
    </div>
  </div>

  <CommonModal
    :open="setUpGuardModal"
    title="Set up guard screen"
    @change-modal-status="
      (value) => {
        setUpGuardModal = value;
      }
    "
  >
    <template v-slot:content>
      <div class="flex flex-col gap-4">
        <CommonFormInput
          inputType="text"
          v-model="email"
          title="set your recovery email"
        />
        <CommonFormInput
          inputType="password"
          v-model="password"
          title="set your password"
        />
      </div>
    </template>
    <template v-slot:footer>
      <CommonButton
        text="Cancel"
        @btn-action="setUpGuardModal = false"
        custom-css="bg-red-400 w-full text-black"
      />
      <CommonButton
        text="Apply"
        @btn-action="updateUserRecord"
        custom-css="!bg-blue-400 w-full text-black"
        :loading="enableGuardBtnLoading"
      />
    </template>
  </CommonModal>
</template>

<script lang="ts">
import { notify } from "@kyvg/vue3-notification";
import { USER } from "~/services/schemas";

import { useAppStore } from "~/store";

export default defineComponent({
  setup() {
    useSeoMeta({
      title: "Settings",
      ogTitle: "Settings",
    });

    const { user } = storeToRefs(useAppStore());
    const { setUser, setAppLocked } = useAppStore();
    const { findOrUpdateRecord } = useWeb5VueUtils();

    const email = ref(user.value.email);
    const password = ref("");

    const setUpGuardModal = ref(false);
    const enableGuardBtnLoading = ref(false);

    const handleEnableLockScreenSwitchChange = async (newVal: boolean) => {
      if (newVal) {
        setUpGuardModal.value = true;
      } else {
        const userRecord = await findOrUpdateRecord(
          {
            ...user.value,
            isGuardScreenEnabled: false,
          },
          USER
        );
        setUser(userRecord);
      }
    };
    const updateUserRecord = async () => {
      try {
        const hashedPassword = await hashPassword(password.value);
        const userRecord = await findOrUpdateRecord(
          {
            email: email.value,
            isGuardScreenEnabled: true,
            password: hashedPassword,
          },
          USER
        );
        setUser(userRecord);
        setAppLocked(false);
        notify({
          type: "success",
          title: "guard screen setup updated",
        });
      } finally {
        setUpGuardModal.value = false;
      }
    };
    return {
      email,
      password,
      user,
      enableGuardBtnLoading,
      setUpGuardModal,
      updateUserRecord,
      handleEnableLockScreenSwitchChange,
    };
  },
});
</script>
