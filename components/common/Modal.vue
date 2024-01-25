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
              class="inline-block transform overflow-hidden rounded-t-xl md:rounded-b-xl bg-bgbase py-3 h-full w-[50rem] text-left shadow-xl transition-all sm:align-middle"
            >
              <div
                class="border-b-[1px] px-4 border-base flex items-center pb-3 justify-between"
              >
                <p class="font-black text-left">
                  {{ title }}
                </p>
                <font-awesome-icon
                  icon="fa-solid fa-xmark"
                  class="bg-lightbase rounded-lg h-5 w-5 p-1"
                  @click="closeModal"
                />
              </div>
              <div class="p-4"><slot name="content"></slot></div>
              <div
                class="px-4 pt-3 flex gap-2 font-bold border-t-[1px] border-base"
              >
                <slot name="footer"></slot>
              </div>
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
