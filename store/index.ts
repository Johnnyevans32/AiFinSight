import { Currency } from "~/types/mono";
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
  WHITE = "white",
}

export const useAppStore = defineStore("appStore", () => {
  const appThemeColor = ref<string>("light");
  const loadingScreenEnabled = ref<boolean>(false);
  const loadingScreenText = ref(
    "Migrating financial data, it might take a while.... hang tight 👨🏽‍🔧"
  );

  const currency = ref(Currency.NGN);

  const accounts = ref<AccountDTO[]>([]);
  const assets = ref<AccountAssetDTO[]>([]);
  const transactions = ref<AccountStatementDTO[]>([]);
  const budgets = ref<BudgetDTO[]>([]);

  function toggleAppTheme(theme: string) {
    appThemeColor.value = theme;
  }

  function setCurrency(_currency: Currency) {
    currency.value = _currency;
  }

  function updateLoadingScreenStatus(status: boolean) {
    loadingScreenEnabled.value = status;
  }

  function updateLoadingScreenText(
    _loadingScreenText: string = "Migrating financial data, it might take a while.... hang tight 👨🏽‍🔧"
  ) {
    loadingScreenText.value = _loadingScreenText;
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
    loadingScreenText,
    currency,
    toggleAppTheme,
    updateLoadingScreenStatus,
    setTransactions,
    setAssets,
    setAccounts,
    setBudgets,
    setCurrency,
    updateLoadingScreenText,
  };
});
