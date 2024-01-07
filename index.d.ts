import AccountService from "~/services/account";

interface ApiInstance {
  accountService: AccountService;
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
