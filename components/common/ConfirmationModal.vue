<template>
  <CommonModal
    :open="open"
    :title="title"
    @change-modal-status="changeModalStatus"
  >
    <template v-slot:content>
      <p>{{ desc }}</p>
    </template>
    <template v-slot:footer>
      <CommonButton
        text="Confirm"
        @btn-action="handleBtnClickAction"
        custom-css="bg-red-400 w-full text-black"
        :loading="loading"
      />
      <CommonButton
        text="Cancel"
        @btn-action="changeModalStatus(false)"
        custom-css="!bg-green-400 w-full text-black"
      />
    </template>
  </CommonModal>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    open: {
      type: Boolean,
    },
    desc: {
      type: String,
    },
    title: {
      type: String,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["changeModalStatus", "confirmModalAction"],
  setup(props, ctx) {
    const changeModalStatus = (value: boolean) =>
      ctx.emit("changeModalStatus", value);

    const handleBtnClickAction = () => ctx.emit("confirmModalAction");

    return { changeModalStatus, handleBtnClickAction };
  },
});
</script>
