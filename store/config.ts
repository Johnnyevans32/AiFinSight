export const useAppUserConfigStore = defineStore(
  "appUserConfigStore",
  () => {
    const dwnEndpoint = ref("https://dwn.tbddev.org/dwn1");

    function setDwnEndpoint(_dwnEndpoint: string) {
      dwnEndpoint.value = _dwnEndpoint;
    }

    return {
      dwnEndpoint,
      setDwnEndpoint,
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
