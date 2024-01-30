<template>
  <div v-for="(conversations, date) in formatedConvos" :key="date">
    <span class="px-2 py-1 rounded-xl bg-lightbase">{{ date }}</span>
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
          <p class="font-bold">user</p>
          <p>{{ conversation.user }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div
          class="w-10 h-10 rounded-xl bg-lightbase flex items-center justify-center"
        >
          <font-awesome-icon icon="robot" />
        </div>

        <div class="flex flex-col items-start">
          <p class="font-bold">ai</p>
          <p>{{ conversation.ai }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CONVERSATIONS } from "~/services/schemas";
import { ConversationDTO } from "~/types/accounts";
import { useAppStore } from "~/store";

export default defineComponent({
  setup() {
    const { $did } = useNuxtApp();

    const { conversations } = storeToRefs(useAppStore());

    const { setConversations } = useAppStore();

    const myDid = ref<string>($did);
    const { findRecords } = useAppVueUtils();

    onBeforeMount(async () => {
      try {
        const [dbConversations] = await Promise.all([
          findRecords<ConversationDTO[]>(CONVERSATIONS),
        ]);
        setConversations(dbConversations);
      } catch (err) {
        console.log("before mount error", { err });
      }
    });

    const formatedConvos = computed(() =>
      groupByDate(conversations.value, "date", "ddd MMM Do, YYYY")
    );

    return { myDid, formatedConvos };
  },
});
</script>
