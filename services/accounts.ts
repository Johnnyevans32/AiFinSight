import {
  currencySignMap,
  type AccountAssetDTO,
  type AccountDTO,
  type BankDTO,
} from "~/types/accounts";
import type {
  AccountDetail,
  AccountLinkProviderResponse,
  Currency,
  IAccountAssetResponse,
  IAccountStatementResponse,
  IAccountTransactionResponse,
} from "~/types/mono";

class AccountService {
  async connect(authCode: string): Promise<string> {
    const { useCustomFetch } = useAppVueUtils();
    const res = await useCustomFetch<string>("/api/accounts/connect", {
      method: "post",
      body: { code: authCode },
    });
    return res;
  }

  async disconnect(accountId: string): Promise<void> {
    const { useCustomFetch } = useAppVueUtils();
    await useCustomFetch<void>(`/api/accounts/${accountId}/disconnect`, {
      method: "post",
    });
  }

  async getAccountStatement(accountId: string) {
    const { useCustomFetch } = useAppVueUtils();
    const { data } = await useCustomFetch<
      AccountLinkProviderResponse<IAccountStatementResponse>
    >(`/api/accounts/${accountId}/statement`, {
      method: "get",
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
  }
  async getAccountTransactions(accountId: string) {
    const { useCustomFetch } = useAppVueUtils();
    const res = await useCustomFetch<IAccountTransactionResponse>(
      `/api/accounts/${accountId}/transactions`,
      {
        method: "get",
      }
    );
    return res.data;
  }

  async getAccountAssets(accountId: string): Promise<AccountAssetDTO[]> {
    const { useCustomFetch } = useAppVueUtils();
    const { assets } = await useCustomFetch<IAccountAssetResponse>(
      `/api/accounts/${accountId}/assets`,
      {
        method: "get",
      }
    );

    return assets.map((asset) => {
      const currency = asset.currency.toUpperCase() as Currency;
      return {
        accountId,
        assetId: asset._id,
        name: asset.name,
        cost: asset.cost,
        type: asset.type,
        return: asset.return,
        quantity: asset.quantity,
        currency,
        price: asset.details.price,
        currencySign: currencySignMap[currency],
        meta: asset,
      };
    });
  }

  async getAccountDetail(accountId: string): Promise<AccountDTO> {
    const { useCustomFetch, groupBy, extractBgColorsFromImage } =
      useAppVueUtils();
    const { data } = await useCustomFetch<
      AccountLinkProviderResponse<AccountDetail>
    >(`/api/accounts/${accountId}/detail`, {
      method: "get",
    });
    const banks = await useCustomFetch<BankDTO[]>("/api/banks", {
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
  }

  async queryContextualGpt(context: string, prompt: string) {
    const { useCustomFetch } = useAppVueUtils();
    const response = await useCustomFetch<string>(`/api/contextual_gpt`, {
      method: "post",
      body: { context, prompt },
    });
    return response;
  }
}

export default AccountService;
