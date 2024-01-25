import AccountService from "~/services/accounts";

export default defineNuxtPlugin(() => {
  const modules = {
    accountService: new AccountService(),
  };

  return {
    provide: {
      api: modules,
    },
  };
});
