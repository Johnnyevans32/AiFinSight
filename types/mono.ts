export interface AccountLinkProviderResponse<T> {
  status: string;
  message: string;
  data: T;
}
export enum TransactionType {
  CREDIT = "credit",
  DEBIT = "debit",
}

export enum Currency {
  NGN = "NGN",
  USD = "USD",
}

export interface AccountStatement {
  id?: string;
  _id?: string;
  type: TransactionType;
  amount: number;
  balance?: number;
  date: string;
  narration: string;
  currency: string;
  category?: TransactionCategory;
}

export type IAccountStatementResponse = {
  meta: {
    count: number;
    requested_length?: number;
    available_length: number;
  };
  data: AccountStatement[];
};

export type IAccountTransactionResponse = {
  paging: {
    total: number;
    page: number;
    previous: string;
    next: string;
  };
  data: AccountStatement[];
};

export enum TransactionCategory {
  BETTING_PAYOUT = "betting_payout",
  BETTING_DEPOSIT = "betting_deposit",
  BILLS = "bills",
  CASH_DEPOSIT = "cash_deposit",
  CASH_WITHDRAWAL = "cash_withdrawal",
  CHEQUE = "cheque",
  CHEQUE_DEPOSITS = "cheque_deposits",
  EDUCATION = "education",
  ENTERTAINMENT = "entertainment",
  BANK_CHARGES = "bank_charges",
  FOOD = "food",
  GIFTS_AND_DONATIONS = "gifts_donations",
  GROCERIES = "groceries",
  HEALTH = "health",
  INTEREST_RECEIVED = "interest_received",
  INVESTMENT_PAYOUT = "investment_payout",
  INVESTMENT_DEPOSIT = "investment_deposit",
  LEISURE_ACTIVITIES_TRAVELING = "leisure_activities_traveling",
  LOANS = "loans",
  LOAN_REPAYMENTS = "loan_repayments",
  OTHER_OUTGOING_PAYMENTS = "other_outgoing_payments",
  ONLINE_PAYMENTS = "online_payments",
  OTHER_INCOMING_PAYMENTS = "other_incoming_payments",
  OTHER_INCOMING_PAYMENTS_FROM_EMPLOYER = "other_incoming_payments_from_employer",
  PERSONAL_CARE = "personal_care",
  PERSONAL_TRANSFER = "personal_transfer",
  PHONE_AND_INTERNET = "phone_internet",
  RENT_AND_MAINTENANCE = "rent_maintanence",
  RETURNED_DEBIT = "returned_debit",
  SALARY = "salary",
  SAVINGS = "savings",
  TRANSPORT = "transport",
  UTILITY_SERVICES = "utility_services",
  UNKNOWN = "unknown",
}

export type AccountDetail = {
  id: string;
  name: string;
  type: string;
  account_number: string;
  balance: number;
  currency: string;
  data_status: string;
  institution: {
    name: string;
    type: string;
    bank_code: string;
    auth_method: string;
  };
  created_at: string;
  updated_at: string;
};

export type IAccountAssetResponse = {
  assets: AccountAsset[];
  balances: { [currency in Currency]: number };
  _id: string;
};

export interface AccountAsset {
  _id: string;
  name: string;
  type: string;
  cost: number;
  return: number;
  quantity: number;
  currency: string;
  details: {
    symbol: string;
    price: number;
  };
}

export interface AccountEarning {
  _id: string;
  amount: number;
  narration: string;
  date: string;
  asset: {
    symbol: string;
    name: string;
    sale_price: number;
    quantity_sold: number;
  };
}
