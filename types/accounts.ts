import {
  Currency,
  type TransactionCategory,
  type TransactionType,
} from "./mono";

export type UserDTO = {
  email?: string;
  password?: string;
  isGuardScreenEnabled?: boolean;
  resetPasswordCode?: string;
  resetPasswordCodeExpiresAt?: string;
};

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
  user: string;
  ai: string;
  date: string;
};
