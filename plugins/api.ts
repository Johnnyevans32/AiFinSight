import UserService from "~/services/user";
import AccountService from "~/services/accounts";
import AiService from "~/services/ai";

export default defineNuxtPlugin(() => {
  const modules = {
    accountService: new AccountService(),
    userService: new UserService(),
    aiService: new AiService(),
  };

  return {
    provide: {
      api: modules,
    },
  };
});
