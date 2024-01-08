<template>
  <div class="mb-5 text-left">
    <span v-show="title" class="text-sm"> {{ title }}:</span>
    <input
      :type="inputType"
      :value="modelValue"
      @input="handleModelValueChangeAction($event)"
      :placeholder="placeholder"
      :class="customCss"
      class="form-input rounded-xl px-5 py-3 bg-lightbase w-full border-2 border-base"
    />
    <span
      v-show="validationMessage"
      :class="isErrorMessage ? `text-red-600` : `text-green-600`"
    >
      {{ validationMessage }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    inputType: {
      type: String,
      default: "text",
    },
    title: { type: String, required: false },
    modelValue: {},
    placeholder: { type: String, required: false },
    customCss: {
      type: String,
      required: false,
    },
    isErrorMessage: {
      type: Boolean,
      default: true,
    },
    validationMessage: {
      type: String,
      required: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    const handleModelValueChangeAction = (event: any) =>
      ctx.emit("update:modelValue", event?.target?.value);
    return { handleModelValueChangeAction };
  },
});
</script>
