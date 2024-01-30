<template>
  <TabGroup>
    <TabList
      class="flex space-x-1 rounded-xl w-full md:w-[50%] bg-lightbase p-1"
    >
      <Tab
        v-for="menu in tabMenu"
        as="template"
        :key="menu"
        v-slot="{ selected }"
      >
        <button
          :class="[
            'w-full rounded-xl py-2.5 leading-3 uppercase',
            'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
            selected
              ? 'bg-white shadow'
              : ' hover:bg-white/[0.12] hover:text-white',
          ]"
        >
          {{ menu }}
        </button>
      </Tab>
    </TabList>
    <TabPanels class="mt-5">
      <TabPanel class="grid md:grid-cols-4 gap-4">Content 1</TabPanel>
      <TabPanel class="grid md:grid-cols-4 gap-4">Content 2</TabPanel>
      <TabPanel class="grid md:grid-cols-4 gap-4">Content 3</TabPanel>
    </TabPanels>
  </TabGroup>
</template>

<script lang="ts">
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";

export default defineComponent({
  components: {
    TabGroup,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
  },
  setup(props) {
    const { $api } = useNuxtApp();
    const tabMenu = ref(["home", "postions"]);

    return {
      tabMenu,
    };
  },
});
</script>
