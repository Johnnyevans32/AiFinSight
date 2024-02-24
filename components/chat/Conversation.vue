<template>
  <div
    class="flex flex-col gap-4 overflow-y-scroll overscroll-y-none"
    id="conversation-container"
    @scroll="checkScroll"
  >
    <div
      v-for="(conversations, date) in formatedConvos"
      :key="date"
      class="flex flex-col gap-2"
    >
      <span class="px-2 py-1 rounded-xl bg-lightbase self-center">{{
        date
      }}</span>
      <TransitionGroup name="list" tag="ul" class="flex flex-col gap-2">
        <div
          v-for="(conversation, i) in conversations"
          :key="i"
          class="flex flex-col gap-2"
        >
          <div class="flex items-start gap-2">
            <img
              v-if="myDid && conversation.author === 'user'"
              :src="`https://robohash.org/${myDid}`"
              alt="avatar"
              class="w-10 h-10 rounded-xl bg-lightbase"
            />
            <div
              v-else-if="conversation.author === 'ai'"
              class="w-10 h-10 rounded-xl bg-lightbase flex items-center justify-center"
            >
              <font-awesome-icon icon="fa-brands fa-android" class="text-2xl" />
            </div>
            <div class="flex flex-col items-start">
              <p>
                <b class="font-bold">
                  {{ conversation.author === "user" ? "You " : "Finsight AI " }}
                </b>
                <span class="text-sm">
                  {{ formatDate(conversation.date, "h:mm A") }}</span
                >
              </p>
              <p class="text-left">{{ conversation.message }}</p>
            </div>
          </div>
        </div>
      </TransitionGroup>
      <font-awesome-icon
        v-show="canScrollDown"
        icon="arrow-down"
        class="bg-lightbase rounded-lg h-5 w-5 p-1 cursor-pointer fixed z-10 bottom-[15vh] right-[50vw]"
        @click="scrollDown"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { DateSort } from "@tbd54566975/dwn-sdk-js";
import Typed from "typed.js";

import { CONVERSATIONS } from "~/services/schemas";
import type { ConversationDTO } from "~/types/accounts";
import { useAppStore } from "~/store";

export default defineComponent({
  setup() {
    const { conversations, myDid } = storeToRefs(useAppStore());

    const canScrollDown = ref(false);
    const { setConversations } = useAppStore();

    const { findRecords } = useWeb5VueUtils();
    let typed: Typed;

    onBeforeUnmount(() => {
      if (typed) {
        typed.destroy();
      }
    });
    onBeforeMount(async () => {
      try {
        checkScroll();
        const [dbConversations] = await Promise.all([
          findRecords<ConversationDTO[]>(
            CONVERSATIONS,
            undefined,
            DateSort.CreatedAscending
          ),
        ]);
        setConversations(dbConversations);
      } catch (err) {
        console.log("before mount error", { err });
      }
    });

    const checkScroll = () => {
      const conversationContainer = document.getElementById(
        "conversation-container"
      );
      if (!conversationContainer) return;
      const heightToScroll = Math.abs(
        conversationContainer.scrollHeight -
          conversationContainer.clientHeight -
          conversationContainer.scrollTop
      );
      // Determine if there is space to scroll down
      canScrollDown.value = heightToScroll > 1;
    };

    watch(conversations, () => {
      checkScroll();
    });

    const formatedConvos = computed(() =>
      groupByDate(conversations.value, "date", "ddd MMM Do, YYYY")
    );

    const scrollDown = () => {
      const conversationContainer = document.getElementById(
        "conversation-container"
      );
      if (!conversationContainer) return;

      const lastMessage = conversationContainer.lastElementChild;
      if (!lastMessage) return;

      lastMessage.scrollIntoView({ behavior: "smooth", block: "end" });
    };

    const typeCharacter = (string: string, id: string, loop = false) => {
      const textArea = document.getElementById(id);
      if (textArea) {
        textArea.textContent = "";
        typed = new Typed(textArea, {
          strings: [string],
          showCursor: false,
          loop,
        });
      }
    };

    return {
      myDid,
      formatedConvos,
      scrollDown,
      canScrollDown,
      checkScroll,
    };
  },
});
</script>
<style scoped>
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
