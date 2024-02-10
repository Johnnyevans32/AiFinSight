<template>
  <div class="flex flex-col gap-4">
    <div
      v-for="(conversations, date) in formatedConvos"
      :key="date"
      class="flex flex-col gap-2"
    >
      <span class="px-2 py-1 rounded-xl bg-lightbase self-center">{{
        date
      }}</span>
      <div
        v-for="(conversation, i) in conversations"
        :key="i"
        class="flex flex-col gap-2"
      >
        <div class="flex items-center gap-2">
          <img
            v-if="myDid"
            :src="`https://robohash.org/${myDid}`"
            alt="avatar"
            class="w-10 h-10 rounded-xl bg-lightbase"
          />
          <div class="flex flex-col items-start">
            <p class="font-bold">You:</p>
            <p>{{ conversation.user }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div
            class="w-10 h-10 rounded-xl bg-lightbase flex items-center justify-center"
          >
            <font-awesome-icon icon="fa-brands fa-android" class="text-2xl" />
          </div>

          <div class="flex flex-col items-start">
            <p class="font-bold">Finsight AI:</p>
            <p>{{ conversation.ai }}</p>
            <!-- <p v-if="i !== conversations.length - 1">{{ conversation.ai }}</p>
            <p v-else :id="'typed-ai-' + i"></p> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Typed from "typed.js";

import { CONVERSATIONS } from "~/services/schemas";
import type { ConversationDTO } from "~/types/accounts";
import { useAppStore } from "~/store";

export default defineComponent({
  setup() {
    const { conversations, myDid } = storeToRefs(useAppStore());

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
        const [dbConversations] = await Promise.all([
          findRecords<ConversationDTO[]>(CONVERSATIONS),
        ]);
        setConversations(dbConversations);
        // initializeTypedForLastAiConversation();
      } catch (err) {
        console.log("before mount error", { err });
      }
    });

    const formatedConvos = computed(() =>
      groupByDate(conversations.value, "date", "ddd MMM Do, YYYY")
    );
    const initializeTypedForLastAiConversation = () => {
      const lastIndex = conversations.value.length - 1;
      const lastAiConversation = conversations.value[lastIndex];
      if (lastAiConversation) {
        return typeCharacter(lastAiConversation.ai, `typed-ai-${lastIndex}`);
      }
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

    return { myDid, formatedConvos };
  },
});
</script>
