<template>
  <div class="border-b-[1px] border-base text-left py-5">
    <CommonPageBar mainPage="Settings" />
  </div>

  <img
    v-if="myDid"
    :src="`https://robohash.org/${myDid}`"
    alt="avatar"
    class="w-28 h-28 rounded-xl justify-self-center"
  />

  <span
    v-if="myDid"
    class="cursor-pointer justify-self-center h-8 border-[1px] border-base rounded-xl w-40 bg-lightbase hover:bg-hoverlightbase p-2 flex items-center gap-2 justify-center"
    @click="copyDid"
    >{{ truncateString(myDid) }}
    <font-awesome-icon icon="clone" />
  </span>
  <NuxtLink
    v-for="setting in settingsItems"
    :key="setting.action"
    :to="setting.href"
    :target="setting.external ? '_blank' : ''"
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
        <span class="text-sm specialfont">{{ setting.value }}</span>
      </div>
    </div>
    <font-awesome-icon icon="arrow-right" />
  </NuxtLink>
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
    const { $did } = useNuxtApp();
    const { appThemeColor, currency } = storeToRefs(useAppStore());
    const { dwnEndpoint } = storeToRefs(useAppUserConfigStore());
    const myDid = ref<string>("");

    onBeforeMount(() => (myDid.value = $did));
    const settingsItems = ref([
      {
        logo: "server",
        action: "dwn endpoint",
        value: dwnEndpoint.value,
        logoType: "icon",
        href: "/settings/dwn",
      },
      {
        logo: "fa-solid fa-palette",
        action: "theme",
        value: appThemeColor.value,
        logoType: "icon",
        href: "/settings/theme",
      },
      {
        logo: "dollar-sign",
        action: "currency",
        value: currency.value,
        logoType: "icon",
        href: "/settings/currency",
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
        await navigator.clipboard.writeText(myDid.value);
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
