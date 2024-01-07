export default defineEventHandler(async (event) => {
  try {
    const response = await $fetch(`https://nigerianbanks.xyz`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      } as HeadersInit,
      method: "GET",
    });
    return response;
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: (err as any).message,
    });
  }
});
