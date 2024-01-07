<template>
  <div class="w-full bg-gray-200 rounded-full h-2.5">
    <div
      :class="progressBarColor"
      class="h-2.5 rounded-full"
      :style="'width:' + percentage + '%'"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    percentage: {
      type: Number,
      required: true,
    },
  },
  setup(props, ctx) {
    const progressBarColor = computed(() => {
      if (props.percentage >= 70) {
        return "bg-red-400";
      } else if (props.percentage >= 40 && props.percentage < 70) {
        return "bg-yellow-400";
      } else {
        return "bg-green-400";
      }
    });

    return { progressBarColor };
  },
});
</script>
