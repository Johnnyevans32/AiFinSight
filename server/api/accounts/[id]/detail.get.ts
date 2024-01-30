import { extractBgColorsFromImage, groupBy } from "~/server/util";
import { BankDTO, currencySignMap } from "~/types/accounts";
import {
  AccountDetail,
  AccountLinkProviderResponse,
  Currency,
} from "~/types/mono";

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const accountId = getRouterParam(event, "id");

    const { data } = await $fetch<AccountLinkProviderResponse<AccountDetail>>(
      `${config.monoApiUrl}/v1/accounts/${accountId}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-real-time": true,
          "mono-sec-key": config.monoSecretKey,
        } as any as HeadersInit,
        method: "GET",
      }
    );
    const banks = await $fetch<BankDTO[]>("/api/banks", {
      method: "get",
    });
    const banksGroupedByCode = groupBy(banks, "code");
    const currency = data.currency.toUpperCase() as Currency;
    const bankLogo = banksGroupedByCode[data.institution.bank_code]?.logo;

    let result: any = {};
    if (bankLogo) {
      result = await extractBgColorsFromImage(bankLogo);
    }

    return {
      accountId,
      bankName: data.institution.name,
      balance: data.balance / 100,
      accountNumber: data.account_number,
      accountName: data.name,
      currency,
      bankLogo,
      bankLogoMutedColor: result.mutedColor,
      bankLogoTextColor: result.textColor,
      bankLogoVibrantColor: result.vibrantColor,
      currencySign: currencySignMap[currency],
      meta: data,
    };
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: (err as any).message,
    });
  }
});
