<template>
  <div
    class="sticky top-0 z-10 bg-bgbase inset-x-0 px-4 py-2 border-b-[1px] md:border-b-0 border-base"
  >
    <nav class="grid grid-cols-3 justify-items-center">
      <div class="justify-self-start flex space-x-2 w-40 items-center">
        <img
          v-if="myDid"
          :src="`https://robohash.org/${myDid}`"
          alt="avatar"
          class="w-7 h-7 rounded-full"
        />
        <span class="text-xs">{{ formattedDid }}</span>
      </div>

      <div class="flex justify-center">
        <ul class="md:flex hidden">
          <li
            @click="routeTo(item.href)"
            role="tab"
            class="mr-4 inline-block py-4 rounded-t-lg text-sm text-lightbase border-b-2 border-b-transparent"
            v-bind:class="{ active: activeNavbar === item.name }"
            v-for="item in items"
            :key="item.name"
          >
            <font-awesome-icon :icon="item.icon" />
            {{ item.name }}
          </li>
        </ul>
      </div>
    </nav>

    <!-- fixed nav -->
    <nav
      class="md:hidden fixed bottom-0 inset-x-0 flex justify-between bg-bgbase text-lg text-lightbase border-t-[1px] border-base"
    >
      <a
        v-for="item in items"
        @click="routeTo(item.href)"
        :key="item.name"
        role="tab"
        v-bind:class="{ active: activeNavbar === item.name }"
        class="w-full flex flex-col py-3 px-2 text-center hover:text-base transition duration-300"
      >
        <font-awesome-icon :icon="item.icon" />
        <span class="text-xs">{{ item.name }}</span>
      </a>
    </nav>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    const { $did } = useNuxtApp();

    const { routeTo } = useAppVueUtils();
    const route = useRoute();
    const myDid = ref<string>("");

    const active = ref(true);
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
        name: "Ask Ai",
        icon: "fa-solid fa-user-tie",
        href: "/ask-ai",
      },
      {
        name: "Settings",
        icon: "fa-solid fa-gears",
        href: "/settings",
      },
    ]);
    const accountMenuDropdownOn = ref(false);

    onBeforeMount(async () => {
      try {
        myDid.value = $did;
      } catch (err) {
        console.log("before mount error", { err });
      }
    });

    const formattedDid = computed<string>(() => truncateString(myDid.value));

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
      active,
      items,
      accountMenuDropdownOn,
      activeNavbar,
      routeTo,
      myDid,
      formattedDid,
    };
  },
});
</script>

<style scoped>
[role="tab"].active {
  @apply text-base border-b-base;
}
</style>
