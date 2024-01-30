import type {
  AccountDTO,
  AccountAssetDTO,
  AccountStatementDTO,
  BudgetDTO,
  ConversationDTO,
} from "~/types/accounts";
import { ACCOUNT_TRANSACTIONS, ACCOUNTS, BUDGETS } from "~/services/schemas";

export const useAppStore = defineStore("appStore", () => {
  const loadingScreenEnabled = ref<boolean>(false);
  const loadingScreenText = ref(
    "Migrating financial data, it might take a while.... hang tight 👨🏽‍🔧"
  );

  const recordIsInPullingState = ref<{ [schema: string]: boolean }>({
    [ACCOUNT_TRANSACTIONS]: false,
    [ACCOUNTS]: false,
    [BUDGETS]: false,
  });

  const accounts = ref<AccountDTO[]>([]);
  const assets = ref<AccountAssetDTO[]>([]);
  const transactions = ref<AccountStatementDTO[]>([]);
  const budgets = ref<BudgetDTO[]>([]);
  const conversations = ref<ConversationDTO[]>([]);

  function updateRecordPullingStatus(record: string, status: boolean) {
    recordIsInPullingState.value[record] = status;
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

  function setConversations(_conversations: ConversationDTO[]) {
    conversations.value = _conversations;
  }
  return {
    accounts,
    assets,
    transactions,
    budgets,
    loadingScreenEnabled,
    loadingScreenText,
    recordIsInPullingState,
    conversations,
    updateLoadingScreenStatus,
    setTransactions,
    setAssets,
    setAccounts,
    setBudgets,
    updateLoadingScreenText,
    updateRecordPullingStatus,
    setConversations,
  };
});
