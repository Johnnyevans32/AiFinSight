// import { Web5 } from "@web5/api";
import { Web5 } from "@tbd54566975/web5";

import AccountService from "~/services/account";

export default defineNuxtPlugin(async (nuxtApp) => {
  const modules = {
    accountService: new AccountService(),
  };
  let web5: Web5;
  let did: string;
  try {
    console.log("connecting to web5");
    ({ web5, did } = await Web5.connect({
      techPreview: { dwnEndpoints: ["https://dwn.tbddev.org/dwn3"] },
    }));
    console.log("connected to web5");
  } catch (err) {
    console.error("error from web5", err);
    throw err;
  }
  return {
    provide: {
      api: modules,
      web5,
      did,
    },
  };
});
