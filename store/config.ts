import { Currency } from "~/types/mono";

export enum AppThemeEnum {
  LIGHT = "light",
  DARK = "dark",
  COFFEE = "coffee",
  CHERRY = "cherry",
  WHITE = "white",
  OCEAN = "ocean",
  FOREST = "forest",
  MIDNIGHT = "midnight",
  SUNFLOWER = "sunflower",
}

export const useAppUserConfigStore = defineStore(
  "appUserConfigStore",
  () => {
    const appThemeColor = ref<string>("light");
    const dwnEndpoint = ref("https://dwn.tbddev.org/dwn1");
    const currency = ref(Currency.NGN);

    function setDwnEndpoint(_dwnEndpoint: string) {
      dwnEndpoint.value = _dwnEndpoint;
    }

    function toggleAppTheme(theme: string) {
      appThemeColor.value = theme;
    }
    function setCurrency(_currency: Currency) {
      currency.value = _currency;
    }
    return {
      dwnEndpoint,
      appThemeColor,
      currency,
      setDwnEndpoint,
      toggleAppTheme,
      setCurrency,
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
