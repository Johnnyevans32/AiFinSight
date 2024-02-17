export type UserDTO = {
  recordId?: string;
  email?: string;
  password?: string;
  isGuardScreenEnabled?: boolean;
  resetPasswordCode?: string;
  resetPasswordCodeExpiresAt?: string;
};

export enum TransactionType {
  CREDIT = "credit",
  DEBIT = "debit",
}

export enum Currency {
  NGN = "NGN",
  USD = "USD",
}

export interface ResponseObject<T> {
  code?: string;
  message?: string;
  data: T;
  meta?: any;
}

export type AccountDTO = {
  recordId?: string;
  accountId: string;
  bankName: string;
  balance: number;
  bankLogo?: string;
  accountNumber: string;
  accountName: string;
  currency: Currency;
  bankLogoVibrantColor?: string;
  bankLogoMutedColor?: string;
  bankLogoTextColor?: string;
  currencySign: string;
  meta: any;
};

export type AccountStatementDTO = {
  recordId?: string;
  accountId: string;
  statementId: string;
  type: TransactionType;
  amount: number;
  balance: number;
  date: string;
  narration: string;
  currency: Currency;
  currencySign: string;
  category?: TransactionCategory;
  meta: any;
};
export type AccountAssetDTO = {
  recordId?: string;
  accountId: string;
  assetId: string;
  name: string;
  type: string;
  cost: number;
  return: number;
  quantity: number;
  currency: Currency;
  currencySign: string;
  price: number;
  meta: any;
};

export type BudgetDTO = {
  recordId?: string;
  category: TransactionCategory;
  limit: number;
  currency: Currency;
  currencySign: string;
  amountSpentOnCategoryBudget?: number;
};

export const currencySignMap = {
  [Currency.NGN]: "₦",
  [Currency.USD]: "$",
};

export type BankDTO = {
  name: string;
  slug: string;
  code: string;
  ussd: string;
  logo: string;
};

export enum ChartPeriodEnum {
  Last7Days = "last 7 days",
  Last12Months = "last 12 months",
}

export type ConversationDTO = {
  recordId?: string;
  author: "ai" | "user";
  message: string;
  date: string;
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
