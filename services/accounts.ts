import {
  type AccountAssetDTO,
  type AccountStatementDTO,
  type AccountDTO,
} from "~/types/accounts";

class AccountService {
  async connect(authCode: string) {
    const { useCustomFetch } = useAppVueUtils();
    const res = await useCustomFetch<string>("/api/accounts/connect", {
      method: "post",
      body: { code: authCode },
    });
    return res;
  }

  async disconnect(accountId: string) {
    const { useCustomFetch } = useAppVueUtils();
    await useCustomFetch<void>(`/api/accounts/${accountId}/disconnect`, {
      method: "post",
    });
  }

  async getAccountStatement(accountId: string) {
    const { useCustomFetch } = useAppVueUtils();
    const data = await useCustomFetch<AccountStatementDTO[]>(
      `/api/accounts/${accountId}/statement`,
      {
        method: "get",
      }
    );
    return data;
  }
  async getAccountTransactions(accountId: string) {
    const { useCustomFetch } = useAppVueUtils();
    const data = await useCustomFetch<AccountStatementDTO[]>(
      `/api/accounts/${accountId}/transactions`,
      {
        method: "get",
      }
    );
    return data;
  }

  async getAccountAssets(accountId: string) {
    const { useCustomFetch } = useAppVueUtils();
    const data = await useCustomFetch<AccountAssetDTO[]>(
      `/api/accounts/${accountId}/assets`,
      {
        method: "get",
      }
    );

    return data;
  }

  async getAccountDetail(accountId: string) {
    const { useCustomFetch } = useAppVueUtils();

    const data = await useCustomFetch<AccountDTO>(
      `/api/accounts/${accountId}/detail`,
      {
        method: "get",
      }
    );
    return data;
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
