<template>
  <div class="border-b-[1px] border-base text-left py-5">
    <CommonPageBar mainPage="Chat" />
  </div>

  <ChatContent />
</template>
<script lang="ts">
export default defineComponent({
  async setup() {
    useSeoMeta({
      title: "Chat",
      ogTitle: "Chat",
    });

    return {};
  },
});
</script>
