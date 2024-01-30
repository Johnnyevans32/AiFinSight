import { currencySignMap } from "~/types/accounts";
import {
  AccountLinkProviderResponse,
  Currency,
  IAccountStatementResponse,
} from "~/types/mono";

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const accountId = getRouterParam(event, "id");
    const { data } = await $fetch<
      AccountLinkProviderResponse<IAccountStatementResponse>
    >(`${config.monoApiUrl}/v1/accounts/${accountId}/statement`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-real-time": true,
        "mono-sec-key": config.monoSecretKey,
      } as any as HeadersInit,
      method: "GET",
      query: { period: "last12months" },
    });

    return data.statement.map((d) => {
      const currency = d.currency.toUpperCase() as Currency;
      return {
        accountId,
        statementId: d._id,
        type: d.type,
        amount: d.amount / 100,
        balance: (d.balance || 0) / 100,
        date: d.date,
        narration: d.narration,
        currency,
        category: d.category,
        currencySign: currencySignMap[currency],
        meta: d,
      };
    });
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: (err as any).message,
    });
  }
});
