export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const accountId = getRouterParam(event, "id");
    const response = await $fetch(
      `${config.monoApiUrl}/accounts/${accountId}/unlink`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-real-time": true,
          "mono-sec-key": config.monoSecretKey,
        } as any as HeadersInit,
        method: "POST",
      }
    );
    return response;
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: (err as any).message,
    });
  }
});
