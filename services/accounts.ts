import {
  type AccountAssetDTO,
  type AccountStatementDTO,
  type AccountDTO,
  ResponseObject,
} from "~/types/accounts";

class AccountService {
  async connect(authCode: string) {
    const { useCustomFetch } = useAppVueUtils();
    const { data } = await useCustomFetch<ResponseObject<string>>(
      "/api/user-accounts/connect",
      {
        method: "post",
        body: { code: authCode },
      }
    );
    return data;
  }

  async disconnect(accountId: string) {
    const { useCustomFetch } = useAppVueUtils();
    await useCustomFetch<ResponseObject<void>>(
      `/api/user-accounts/${accountId}/disconnect`,
      {
        method: "put",
      }
    );
  }

  async getAccountStatement(accountId: string) {
    const { useCustomFetch } = useAppVueUtils();
    const { data } = await useCustomFetch<
      ResponseObject<AccountStatementDTO[]>
    >(`/api/user-accounts/${accountId}/statement`, {
      method: "get",
    });
    return data;
  }
  async getAccountTransactions(accountId: string) {
    const { useCustomFetch } = useAppVueUtils();
    const { data } = await useCustomFetch<
      ResponseObject<AccountStatementDTO[]>
    >(`/api/user-accounts/${accountId}/transactions`, {
      method: "get",
    });
    return data;
  }

  async getAccountAssets(accountId: string) {
    const { useCustomFetch } = useAppVueUtils();
    const { data } = await useCustomFetch<ResponseObject<AccountAssetDTO[]>>(
      `/api/user-accounts/${accountId}/assets`,
      {
        method: "get",
      }
    );

    return data;
  }

  async getAccountDetail(accountId: string) {
    const { useCustomFetch } = useAppVueUtils();

    const { data } = await useCustomFetch<ResponseObject<AccountDTO>>(
      `/api/user-accounts/${accountId}/detail`,
      {
        method: "get",
      }
    );
    return data;
  }
}

export default AccountService;
