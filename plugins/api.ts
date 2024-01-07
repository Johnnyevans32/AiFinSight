import { Web5 } from "@web5/api";

import AccountService from "~/services/account";

export default defineNuxtPlugin(async (nuxtApp) => {
  const modules = {
    accountService: new AccountService(),
  };
  let web5: Web5;
  let did: string;
  console.log("connecting to web5 ");
  ({ web5, did } = await Web5.connect());
  console.log({ did });
  return {
    provide: {
      api: modules,
      web5,
      did,
    },
  };
});
