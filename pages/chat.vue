<template>
  <div class="border-b-[1px] border-base text-left py-5">
    <CommonPageBar mainPage="Chat" />
  </div>

  <CommonTabSwitch :tabMenu="tabMenu" />
</template>
<script lang="ts">
import ChatContent from "~/components/chat/ChatContent.vue";
import ChatConversation from "~/components/chat/ChatConversation.vue";
export default defineComponent({
  async setup() {
    useSeoMeta({
      title: "Chat",
      ogTitle: "Chat",
    });
    const tabMenu = shallowRef([
      { title: "Chat", content: ChatContent },
      { title: "Conversations", content: ChatConversation },
    ]);

    return { tabMenu };
  },
});
</script>
