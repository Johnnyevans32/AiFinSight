import { currencySignMap } from "~/types/accounts";
import { Currency, IAccountAssetResponse } from "~/types/mono";

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const accountId = getRouterParam(event, "id");

    const { assets } = await $fetch<IAccountAssetResponse>(
      `${config.monoApiUrl}/accounts/${accountId}/assets`,
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
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: (err as any).message,
    });
  }
});
