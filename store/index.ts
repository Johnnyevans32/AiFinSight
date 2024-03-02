import type {
  AccountDTO,
  AccountAssetDTO,
  AccountStatementDTO,
  BudgetDTO,
  ConversationDTO,
  UserDTO,
} from "~/types/accounts";
import { ACCOUNT_TRANSACTIONS, ACCOUNTS, BUDGETS } from "~/services/schemas";

export const useAppStore = defineStore("appStore", () => {
  const loadingScreenEnabled = ref<boolean>(false);
  const loadingScreenText = ref(
    "We're fetching your financial data from your bank. This process may take a minute or more, so you might want to grab a coffee and relax. Hang tight! 👨🏽‍🔧"
  );

  const appLocked = ref(true);

  const recordIsInPullingState = ref<{ [schema: string]: boolean }>({
    [ACCOUNT_TRANSACTIONS]: false,
    [ACCOUNTS]: false,
    [BUDGETS]: false,
  });

  const myDid = ref<string>("");
  const vcJwt = ref<string>("");
  const user = ref<UserDTO>({});
  const accounts = ref<AccountDTO[]>([]);
  const assets = ref<AccountAssetDTO[]>([]);
  const transactions = ref<AccountStatementDTO[]>([]);
  const transactionsInPageView = ref<AccountStatementDTO[]>([]);
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
  function setMyDid(_did: string) {
    myDid.value = _did;
  }

  function setVcJwt(_vcJwt: string) {
    vcJwt.value = _vcJwt;
  }

  function setTransactions(_transactions: AccountStatementDTO[]) {
    transactions.value = _transactions;
    transactionsInPageView.value = _transactions;
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

  function setUser(_user: UserDTO) {
    user.value = _user;
  }

  function setAppLocked(_state: boolean) {
    appLocked.value = _state;
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
    myDid,
    appLocked,
    vcJwt,
    setAppLocked,
    updateLoadingScreenStatus,
    setTransactions,
    setAssets,
    setAccounts,
    setBudgets,
    updateLoadingScreenText,
    updateRecordPullingStatus,
    setConversations,
    setMyDid,
    user,
    setUser,
    setVcJwt,
    transactionsInPageView,
  };
});
