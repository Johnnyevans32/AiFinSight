import {
  Currency,
  type TransactionCategory,
  type TransactionType,
} from "./mono";

export type AccountDTO = {
  recordId?: string;
  accountId: string;
  bankName: string;
  balance: number;
  bankLogo?: string;
  accountNumber: string;
  accountName: string;
  currency: Currency;
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
  assetId: string;
  name: string;
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
