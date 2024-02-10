import { storeToRefs } from "pinia";
import { USER } from "~/services/schemas";
import { useAppStore } from "~/store";

export default defineNuxtRouteMiddleware(async (to) => {
  const { setUser } = useAppStore();
  const { appLocked, user } = storeToRefs(useAppStore());
  const { findOrUpdateRecord } = useWeb5VueUtils();

  if (!Object.keys(user.value).length) {
    const dbUser = await findOrUpdateRecord({}, USER, false);
    setUser(dbUser);
  }

  if (!to.meta.layout || to.meta.layout === "default") {
    if (appLocked.value && user.value.isGuardScreenEnabled) {
      return navigateTo(`/guard?redirect=${to.fullPath}`);
    }
  }
  if (to.meta.layout === "guard") {
    if (!appLocked.value || !user.value.isGuardScreenEnabled) {
      return navigateTo("/");
    }
  }
});
