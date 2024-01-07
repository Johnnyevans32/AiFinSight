import type {
  AccountDTO,
  AccountAssetDTO,
  AccountStatementDTO,
  BudgetDTO,
} from "~/types/accounts";

export enum AppThemeEnum {
  LIGHT = "light",
  DARK = "dark",
  COFFEE = "coffee",
  CHERRY = "cherry",
}

export const useAppStore = defineStore("appStore", () => {
  const appThemeColor = ref<string>("light");
  const loadingScreenEnabled = ref<boolean>(false);

  const accounts = ref<AccountDTO[]>([]);
  const assets = ref<AccountAssetDTO[]>([]);
  const transactions = ref<AccountStatementDTO[]>([]);
  const budgets = ref<BudgetDTO[]>([]);

  function toggleAppTheme(theme: string) {
    appThemeColor.value = theme;
  }

  function updateLoadingScreenStatus(status: boolean) {
    loadingScreenEnabled.value = status;
  }

  function setTransactions(_transactions: AccountStatementDTO[]) {
    transactions.value = _transactions;
  }

  function setAssets(_assets: AccountAssetDTO[]) {
    assets.value = _assets;
  }
  function setAccounts(_accounts: AccountDTO[]) {
    accounts.value = _accounts;
  }

  function setBudgets(_budgets: BudgetDTO[]) {
    budgets.value = _budgets;
  }

  return {
    accounts,
    assets,
    transactions,
    budgets,
    appThemeColor,
    loadingScreenEnabled,
    toggleAppTheme,
    updateLoadingScreenStatus,
    setTransactions,
    setAssets,
    setAccounts,
    setBudgets,
  };
});
