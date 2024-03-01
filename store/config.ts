import { Currency } from "~/types/accounts";

export enum AppThemeEnum {
  LIGHT = "light",
  WHITE = "white",
  DARK = "dark",
  MIDNIGHT = "midnight",
  COFFEE = "coffee",
  // FOREST = "forest",
  // OCEAN = "ocean",
  LAVENDER_DREAM = "lavender-dream",
  LEMON = "lemon",
}

export const useAppUserConfigStore = defineStore(
  "appUserConfigStore",
  () => {
    const appThemeColor = ref<string>("white");
    const dwnEndpoint = ref("https://dwn.tbddev.org/dwn1");
    const currency = ref(Currency.NGN);
    const durationOfScreenLockUntilLockInMins = ref(5);

    function setDwnEndpoint(_dwnEndpoint: string) {
      dwnEndpoint.value = _dwnEndpoint;
    }

    function toggleAppTheme(theme: string) {
      appThemeColor.value = theme;
    }
    function setCurrency(_currency: Currency) {
      currency.value = _currency;
    }

    function setDurationOfScreenLockUntilLockInMins(_time: number) {
      durationOfScreenLockUntilLockInMins.value = _time;
    }
    return {
      dwnEndpoint,
      appThemeColor,
      currency,
      durationOfScreenLockUntilLockInMins,
      setDwnEndpoint,
      toggleAppTheme,
      setCurrency,
      setDurationOfScreenLockUntilLockInMins,
    };
  },
  {
    persist: {
      storage: persistedState.localStorage,
      afterRestore: (ctx) => {
        console.log(`just restored '${ctx.store.$id}'`);
      },
    },
  }
);
