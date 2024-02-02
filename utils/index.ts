import moment from "moment";
import { ProtocolDefinition } from "@tbd54566975/dwn-sdk-js";

import {
  ACCOUNTS,
  ACCOUNT_ASSETS,
  ACCOUNT_TRANSACTIONS,
  BUDGETS,
  CONVERSATIONS,
} from "~/services/schemas";
import { TransactionCategory } from "~/types/mono";

export const formatMoney = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatDate = (date: string, format = "MMM Do YY") =>
  moment(date).format(format);

export const groupByDate = <T>(
  array: T[],
  dateField: keyof T,
  format = "MMM Do YY"
) => {
  return array.reduce((result: Record<string, T[]>, item: T) => {
    const key = formatDate(item[dateField] as string, format);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
};
export const truncateString = (data: string) =>
  `${data.substring(0, 7)}...${data.slice(data.length - 4)}`;

export const generateIconMap = (category: TransactionCategory) => {
  const categoryIconMap = {
    [TransactionCategory.BETTING_PAYOUT]: "fas fa-coins",
    [TransactionCategory.BETTING_DEPOSIT]: "fas fa-coins",
    [TransactionCategory.BILLS]: "fas fa-file-invoice-dollar",
    [TransactionCategory.CASH_DEPOSIT]: "fas fa-money-bill-wave-alt",
    [TransactionCategory.CASH_WITHDRAWAL]: "fas fa-money-bill-wave",
    [TransactionCategory.CHEQUE]: "fas fa-money-check",
    [TransactionCategory.CHEQUE_DEPOSITS]: "fas fa-money-check",
    [TransactionCategory.EDUCATION]: "fas fa-graduation-cap",
    [TransactionCategory.ENTERTAINMENT]: "fas fa-film",
    [TransactionCategory.BANK_CHARGES]: "fas fa-money-bill",
    [TransactionCategory.FOOD]: "fas fa-utensils",
    [TransactionCategory.GIFTS_AND_DONATIONS]: "fas fa-gift",
    [TransactionCategory.GROCERIES]: "fas fa-shopping-basket",
    [TransactionCategory.HEALTH]: "fas fa-medkit",
    [TransactionCategory.INTEREST_RECEIVED]: "fas fa-hand-holding-usd",
    [TransactionCategory.INVESTMENT_PAYOUT]: "fas fa-chart-line",
    [TransactionCategory.INVESTMENT_DEPOSIT]: "fas fa-chart-line",
    [TransactionCategory.LEISURE_ACTIVITIES_TRAVELING]: "fas fa-plane",
    [TransactionCategory.LOANS]: "fas fa-hand-holding-usd",
    [TransactionCategory.LOAN_REPAYMENTS]: "fas fa-hand-holding-usd",
    [TransactionCategory.OTHER_OUTGOING_PAYMENTS]: "fas fa-money-bill-alt",
    [TransactionCategory.ONLINE_PAYMENTS]: "fas fa-globe",
    [TransactionCategory.OTHER_INCOMING_PAYMENTS]: "fas fa-hand-holding-usd",
    [TransactionCategory.OTHER_INCOMING_PAYMENTS_FROM_EMPLOYER]:
      "fas fa-hand-holding-usd",
    [TransactionCategory.PERSONAL_CARE]: "fas fa-user",
    [TransactionCategory.PERSONAL_TRANSFER]: "fas fa-exchange-alt",
    [TransactionCategory.PHONE_AND_INTERNET]: "fas fa-phone",
    [TransactionCategory.RENT_AND_MAINTENANCE]: "fas fa-home",
    [TransactionCategory.RETURNED_DEBIT]: "fas fa-hand-holding-usd",
    [TransactionCategory.SALARY]: "fas fa-hand-holding-usd",
    [TransactionCategory.SAVINGS]: "fas fa-piggy-bank",
    [TransactionCategory.TRANSPORT]: "fas fa-bus",
    [TransactionCategory.UTILITY_SERVICES]: "fas fa-bolt",
    [TransactionCategory.UNKNOWN]: "fas fa-question-circle",
  };
  return (
    categoryIconMap[category] || categoryIconMap[TransactionCategory.UNKNOWN]
  );
};

type SortDirection = "ascending" | "descending";

export const paginate = <T>(
  data: T[],
  pageNumber: number,
  itemsPerPage = 10,
  sortColumnName: keyof T,
  sortDirection: SortDirection = "descending"
): T[] => {
  const sortMethod = (a: T, b: T): number => {
    const aValue = a[sortColumnName];
    const bValue = b[sortColumnName];

    if (sortColumnName === "date") {
      return sortDirection === "ascending"
        ? moment(aValue as string).diff(moment(bValue as string))
        : moment(bValue as string).diff(moment(aValue as string));
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "ascending" ? aValue - bValue : bValue - aValue;
    }

    const compareResult = String(aValue).localeCompare(String(bValue));
    return sortDirection === "ascending" ? compareResult : -compareResult;
  };

  const sortedData = data.slice().sort(sortMethod);

  const startIndex = pageNumber * itemsPerPage - itemsPerPage;
  const endIndex = pageNumber * itemsPerPage;

  return sortedData.slice(startIndex, endIndex);
};

export const generateMailToLink = () => {
  const config = useRuntimeConfig();
  const subject = encodeURIComponent(`issue with ${config.public.appName}`);
  return `mailto:${config.public.appContactEmail}?subject=${subject}`;
};

export const shortenString = (str: string, maxLength = 20) => {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + "...";
};

export const schemaPathMap: any = {
  [ACCOUNT_TRANSACTIONS]: `${ACCOUNTS}/${ACCOUNT_TRANSACTIONS}`,
  [ACCOUNT_ASSETS]: `${ACCOUNTS}/${ACCOUNT_ASSETS}`,
  [ACCOUNTS]: ACCOUNTS,
  [BUDGETS]: BUDGETS,
  [CONVERSATIONS]: CONVERSATIONS,
};

export const protocolDefinition: ProtocolDefinition = {
  protocol: "https://didcomm.org/finance-insight",
  published: true,
  types: {
    ...Object.fromEntries(
      [
        ACCOUNT_TRANSACTIONS,
        ACCOUNT_ASSETS,
        ACCOUNTS,
        BUDGETS,
        CONVERSATIONS,
      ].map((schema) => [
        schema,
        {
          schema: `https://didcomm.org/finance-insight/schemas/${schema}.json`,
          dataFormats: ["application/json"],
        },
      ])
    ),
  },
  structure: {
    [ACCOUNTS]: {
      $actions: [
        {
          who: "author",
          of: ACCOUNTS,
          can: "read",
        },
        {
          who: "anyone",
          can: "write",
        },
      ],
      ...Object.fromEntries(
        [ACCOUNT_TRANSACTIONS, ACCOUNT_ASSETS].map((schema) => [
          schema,
          {
            $actions: [
              {
                who: "author",
                of: ACCOUNTS,
                can: "write",
              },
              {
                who: "author",
                of: ACCOUNTS,
                can: "read",
              },
            ],
          },
        ])
      ),
    },
    [BUDGETS]: {
      $actions: [
        {
          who: "author",
          of: BUDGETS,
          can: "read",
        },
        {
          who: "anyone",
          can: "write",
        },
      ],
    },
    [CONVERSATIONS]: {
      $actions: [
        {
          who: "author",
          of: CONVERSATIONS,
          can: "read",
        },
        {
          who: "anyone",
          can: "write",
        },
      ],
    },
  },
};

export const groupBy = <T extends Record<string | number, any>>(
  array: T[],
  property: keyof T
): Record<string | number, T> => {
  return array.reduce((acc: Record<string | number, T>, obj: T) => {
    const key = obj[property];
    if (!acc[key]) {
      acc[key] = obj;
    }
    return acc;
  }, {} as Record<string | number, T>);
};
