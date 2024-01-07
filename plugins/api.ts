import { Web5 } from "@web5/api";

import AccountService from "~/services/account";

export default defineNuxtPlugin(async (nuxtApp) => {
  const modules = {
    accountService: new AccountService(),
  };
  let web5: Web5;
  let did: string;
  ({ web5, did } = await Web5.connect());

  return {
    provide: {
      api: modules,
      web5,
      did,
    },
  };
});
