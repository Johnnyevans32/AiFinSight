import VueClipboard from "vue-clipboard3";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueClipboard, {});
});
