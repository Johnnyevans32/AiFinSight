<template>
  <div class="grid grid-cols-4 gap-y-4 h-screen">
    <div class="col-span-4 md:col-start-2 md:col-span-2">
      <div class="grid grid-cols-1 gap-2 p-5">
        <div class="mb-5 border-b-2 border-base text-left py-5">
          <CommonPageBar mainPage="Settings" />
        </div>
        <div class="mb-5">
          <h1 class="text-xl font-bold">Settings</h1>
        </div>
        <img
          v-if="myDid"
          :src="`https://robohash.org/${myDid}`"
          alt="avatar"
          class="w-28 h-28 rounded-full justify-self-center"
        />

        <span
          v-if="myDid"
          class="cursor-pointer justify-self-center h-8 rounded-full w-40 bg-lightbase hover:bg-hoverlightbase p-2 flex items-center gap-2 justify-center"
          @click="copyDid"
          >{{ truncateString(myDid) }}
          <font-awesome-icon icon="fa-solid fa-copy"
        /></span>
        <NuxtLink
          v-for="setting in settingsItems"
          :key="setting.action"
          :to="setting.href"
          :target="setting.external ? '_blank' : ''"
          class="cursor-pointer flex items-center justify-between px-5 h-16 rounded-xl text-base bg-lightbase"
        >
          <div class="flex space-x-2 items-center">
            <div class="w-5">
              <font-awesome-icon
                v-if="setting.logoType === 'icon'"
                :icon="setting.logo"
              />
              <img
                v-else
                :src="setting.logo"
                alt="qr"
                class="w-10 rounded-full"
              />
            </div>
            <div class="flex flex-col text-left">
              <span class="capitalize font-bold">{{ setting.action }}</span>
              <span class="capitalize text-sm">{{ setting.value }}</span>
            </div>
          </div>
          <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { notify } from "@kyvg/vue3-notification";
import useClipboard from "vue-clipboard3";

import { defineComponent } from "vue";
import { useAppStore } from "~/store";

export default defineComponent({
  setup() {
    const { $did } = useNuxtApp();
    const { appThemeColor } = storeToRefs(useAppStore());
    const myDid = ref<string>("");

    const { toClipboard } = useClipboard();

    onBeforeMount(async () => {
      try {
        myDid.value = $did;
      } catch (err) {
        console.log("before mount error", { err });
      }
    });
    const settingsItems = ref([
      {
        logo: "fa-solid fa-palette",
        action: "theme",
        value: appThemeColor.value,
        logoType: "icon",
        href: "/settings/theme",
      },
      {
        logo: "fa-solid fa-bug",
        action: "report an issue",
        value: "we will respond as soon as we can 👨🏽‍🔧",
        logoType: "icon",
        external: true,
        href: generateMailToLink(),
      },
    ]);

    const copyDid = async () => {
      try {
        await toClipboard(myDid.value);
        notify({
          type: "success",
          title: `copied`,
        });
      } catch (e) {
        console.error(e);
      }
    };

    return {
      settingsItems,
      myDid,
      copyDid,
    };
  },
});
</script>
