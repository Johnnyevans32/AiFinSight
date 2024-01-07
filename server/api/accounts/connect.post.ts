export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const { code } = (await readBody(event)) as { code: string };

    const response = await $fetch<{ id: string }>(
      `${config.monoApiUrl}/account/auth`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "mono-sec-key": config.monoSecretKey,
        } as HeadersInit,
        method: "POST",
        body: { code },
      }
    );
    return response.id;
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: (err as any).message,
    });
  }
});
