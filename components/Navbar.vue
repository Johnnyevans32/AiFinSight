<template>
  <div
    class="sticky top-0 z-10 bg-bgbase inset-x-0 px-4 py-2 md:py-0 border-b-[1px] md:border-b-0 border-base"
  >
    <nav class="grid grid-cols-3 justify-items-center">
      <div class="justify-self-start flex space-x-2 w-40 items-center">
        <img :src="`./logo.jpg`" alt="logo" class="w-7 h-7 rounded-xl" />
        <span class="logo">{{ config.public.appName }}</span>
      </div>

      <div class="flex justify-center">
        <ul class="md:flex hidden">
          <NuxtLink
            :to="item.href"
            role="tab"
            class="cursor-pointer mr-4 inline-block py-4 text-sm text-lightbase border-b-[1px] border-b-transparent"
            v-bind:class="{ active: activeNavbar === item.name }"
            v-for="item in items"
            :key="item.name"
          >
            <font-awesome-icon :icon="item.icon" />
            {{ item.name }}
          </NuxtLink>
        </ul>
      </div>
    </nav>

    <!-- fixed nav -->
    <nav
      class="md:hidden fixed bottom-0 inset-x-0 flex justify-between bg-bgbase text-lg text-lightbase border-t-[1px] border-base"
    >
      <NuxtLink
        v-for="item in items"
        :to="item.href"
        :key="item.name"
        role="tab"
        v-bind:class="{ active: activeNavbar === item.name }"
        class="cursor-pointer w-full flex flex-col py-4 px-2 text-center hover:text-base transition duration-300"
      >
        <font-awesome-icon :icon="item.icon" />
        <!-- <span class="text-xs">{{ item.name }}</span> -->
      </NuxtLink>
    </nav>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    const route = useRoute();
    const config = useRuntimeConfig();

    const items = ref([
      {
        name: "Dashboard",
        icon: "fa-solid fa-chart-pie",
        href: "/",
      },
      {
        name: "Accounts",
        icon: "fa-solid fa-wallet",
        href: "/accounts",
      },
      {
        name: "Analysis",
        icon: "fa-solid fa-chart-line",
        href: "/analysis",
      },
      {
        name: "Budgets",
        icon: "fa-solid fa-money-bill-wave",
        href: "/budgets",
      },
      {
        name: "Chat",
        icon: "fa-solid fa-comments",
        href: "/chat",
      },
      {
        name: "Settings",
        icon: "fa-solid fa-gears",
        href: "/settings",
      },
    ]);

    const activeNavbar = computed(() => {
      const { path } = route;
      if (!path) return "Dashboard";

      const pathSlice = (path as string).split("/");

      return (
        items.value.find((item) => item.href === `/${pathSlice[1]}`)?.name ||
        "Dashboard"
      );
    });

    return {
      items,
      activeNavbar,
      config,
    };
  },
});
</script>

<style scoped>
[role="tab"].active {
  @apply text-base md:border-b-base;
}
</style>
