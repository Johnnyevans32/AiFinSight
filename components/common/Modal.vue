<template>
  <div class="flex items-center justify-center">
    <TransitionRoot as="template" :show="open">
      <Dialog
        as="div"
        class="fixed inset-0 z-10 overflow-y-auto"
        @close="closeModal"
      >
        <div
          class="flex min-h-screen items-end justify-center text-center sm:block sm:p-0"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="ease-in duration-200"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <DialogOverlay
              class="fixed inset-0 bg-lightbase bg-opacity-75 transition-opacity"
            />
          </TransitionChild>

          <!-- This element is to trick the browser into centering the modal contents. -->
          <span
            class="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
            >&#8203;</span
          >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              class="inline-block transform overflow-hidden rounded-t-3xl md:rounded-b-3xl bg-bgbase px-4 py-5 h-full w-[50rem] text-left shadow-xl transition-all sm:align-middle"
            >
              <div
                class="mb-5 pb-5 border-b-[1px] border-base flex items-center justify-between"
              >
                <h1 class="text-2xl font-black text-left">
                  {{ title }}
                </h1>
                <font-awesome-icon
                  icon="fa-solid fa-xmark"
                  class="text-xl"
                  @click="closeModal"
                />
              </div>
              <slot></slot>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script lang="ts">
import {
  Dialog,
  DialogOverlay,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
  },
  props: {
    open: {
      type: Boolean,
    },
    title: {
      type: String,
    },
  },
  emits: ["changeModalStatus"],
  setup(props, ctx) {
    const closeModal = () => ctx.emit("changeModalStatus", false);

    return { closeModal };
  },
});
</script>
