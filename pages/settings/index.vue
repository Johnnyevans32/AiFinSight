<template>
  <div class="border-b-[1px] border-base text-left py-5">
    <CommonPageBar mainPage="Settings" />
  </div>
  <img
    v-if="myDid"
    :src="`https://robohash.org/${myDid}`"
    alt="avatar"
    class="w-28 h-28 rounded-xl justify-self-center border-[1px] border-base bg-lightbase"
  />
  <span
    v-if="myDid"
    class="cursor-pointer justify-self-center h-8 border-[1px] border-base rounded-xl w-40 bg-lightbase hover:bg-hoverlightbase p-2 flex items-center gap-2 justify-center"
    @click="copyDid"
    >{{ truncateString(myDid) }}
    <font-awesome-icon icon="clone" />
  </span>
  <div class="flex flex-col gap-2">
    <NuxtLink
      v-for="setting in settingsItems.filter((i) => !i.disabled)"
      :key="setting.action"
      :to="setting.href"
      @click="setting.settingAction"
      :target="setting.external ? '_blank' : ''"
      :class="setting.customCss"
      class="cursor-pointer flex items-center justify-between px-5 py-2 rounded-xl text-base bg-lightbase border-[1px] border-base"
    >
      <div class="flex space-x-2 items-center">
        <div class="w-5">
          <font-awesome-icon
            v-if="setting.logoType === 'icon'"
            :icon="setting.logo"
          />
          <img v-else :src="setting.logo" alt="qr" class="w-10 rounded-xl" />
        </div>
        <div class="flex flex-col text-left">
          <span class="font-bold">{{ setting.action }}</span>
          <span class="text-sm">{{ setting.value }}</span>
        </div>
      </div>
      <font-awesome-icon icon="arrow-right" />
    </NuxtLink>
  </div>
  <CommonConfirmationModal
    :open="confirmDeletionModal"
    title="Confirm data deletion from dwn"
    desc="Are you sure you want to delete all your data associated with this protocol from your dwn? This action will delete all your financial data and chat conversations associated with this platform from your dwn."
    :loading="deleteAllRecordsBtnLoading"
    @change-modal-status="(value) => (confirmDeletionModal = value)"
    @confirm-modal-action="deleteAllRecords"
  />
</template>

<script lang="ts">
import { notify } from "@kyvg/vue3-notification";

import { useAppUserConfigStore } from "~/store/config";
import { defineComponent } from "vue";
import { useAppStore } from "~/store";

export default defineComponent({
  setup() {
    useSeoMeta({
      title: "Settings",
      ogTitle: "Settings",
    });
    const { deleteRecordsFromProtocol } = useWeb5VueUtils();
    const { myDid, user } = storeToRefs(useAppStore());
    const { setAppLocked } = useAppStore();
    const { dwnEndpoint, appThemeColor, currency } = storeToRefs(
      useAppUserConfigStore()
    );

    const deleteAllRecordsBtnLoading = ref(false);
    const confirmDeletionModal = ref(false);

    const settingsItems = ref([
      {
        logo: "server",
        action: "dwn endpoint",
        value: dwnEndpoint.value,
        logoType: "icon",
        href: "/settings/dwn",
      },
      {
        logo: "shield-halved",
        action: "guard",
        value: "manage settings to guard your data",
        logoType: "icon",
        href: "/settings/guard",
      },
      {
        logo: "fa-solid fa-palette",
        action: "theme",
        value: appThemeColor.value,
        logoType: "icon",
        href: "/settings/theme",
      },
      {
        logo: "naira-sign",
        action: "currency",
        value: currency.value,
        logoType: "icon",
        href: "/settings/currency",
      },
      {
        logo: "user-lock",
        action: "lock app",
        value: "lock app from external intruders",
        logoType: "icon",
        disabled: !user.value.isGuardScreenEnabled,
        settingAction: async () => {
          setAppLocked(true);
          await navigateTo("/guard");
          notify({
            type: "info",
            title: "app locked",
          });
        },
      },
      {
        logo: "fa-solid fa-bug",
        action: "report an issue",
        value: "we will respond as soon as we can 👨🏽‍🔧",
        logoType: "icon",
        external: true,
        href: generateMailToLink(),
      },
      {
        logo: "radiation",
        action: "delete data",
        value: "delete all data associated with this protocol from dwn",
        logoType: "icon",
        customCss: "bg-red-400",
        settingAction: () => (confirmDeletionModal.value = true),
      },
    ]);

    const deleteAllRecords = async () => {
      try {
        deleteAllRecordsBtnLoading.value = true;

        await deleteRecordsFromProtocol(true);

        notify({
          type: "success",
          title: "data deleted from dwn",
        });
      } finally {
        deleteAllRecordsBtnLoading.value = false;
        confirmDeletionModal.value = false;
      }
    };

    const copyDid = async () => {
      await navigator.clipboard.writeText(myDid.value);
      notify({
        type: "success",
        title: `copied`,
      });
    };

    return {
      settingsItems,
      myDid,
      copyDid,
      deleteAllRecords,
      confirmDeletionModal,
      deleteAllRecordsBtnLoading,
    };
  },
});
</script>
