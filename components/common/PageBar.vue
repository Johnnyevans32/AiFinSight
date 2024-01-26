<template>
  <NuxtLink
    class="text-sm items-center font-bold capitalize cursor-pointer"
    @click="router.back()"
  >
    <font-awesome-icon icon="arrow-left" /> {{ mainPage }} /
    {{ currentPage }}
  </NuxtLink>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    currentPage: {
      type: String,
      default: "",
    },
    mainPage: {
      type: String,
      default: "Defi",
    },
  },
  setup() {
    const router = useRouter();

    return { router };
  },
});
</script>
