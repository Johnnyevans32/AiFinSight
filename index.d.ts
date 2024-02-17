import UserService from "~/services/user";
import AccountService from "~/services/accounts";
import AiService from "~/services/ai";

interface ApiInstance {
  accountService: AccountService;
  userService: UserService;
  aiService: AiService;
}

declare module "#app" {
  interface NuxtApp {
    $api: ApiInstance;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $api: ApiInstance;
  }
}

export {};
