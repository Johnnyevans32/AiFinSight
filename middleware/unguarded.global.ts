import { storeToRefs } from "pinia";
import { useAppStore } from "~/store";

export default defineNuxtRouteMiddleware((to) => {
  if (to.meta.layout === "guard") {
    const { appLocked, user } = storeToRefs(useAppStore());
    if (!appLocked.value || !user.value.isGuardScreenEnabled) {
      return navigateTo("/");
    }
  }
});
