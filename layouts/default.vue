<template>
  <div class="font-semibold text-base">
    <Loading />
    <Navbar />
    <slot />
    <FooterBar />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { useAppStore } from "~/store";

export default defineComponent({
  setup() {
    const { appThemeColor } = storeToRefs(useAppStore());

    return { appThemeColor };
  },
});
</script>

<style>
@font-face {
  font-family: "Farfetch Basis Regular";
  src: url("../assets/FarfetchBasisRegular.ttf") format("truetype");
}

html {
  font-family: "Farfetch Basis Regular";
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

.specialfont {
  font-family: "Panchang", sans-serif;
}
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}
</style>
