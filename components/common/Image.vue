<template>
  <img
    v-if="image"
    :src="image"
    class="w-10 h-10 rounded-xl justify-self-center"
    :alt="`${alt} logo`"
  />
  <div
    v-else
    class="bg-base h-10 w-10 text-lightbase rounded-xl flex items-center justify-center text-xl"
  >
    {{ alt?.split("")[0] || "?" }}
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    image: {
      type: String,
    },
    alt: {
      type: String,
    },
  },
  setup(props, ctx) {
    return {};
  },
});
</script>
