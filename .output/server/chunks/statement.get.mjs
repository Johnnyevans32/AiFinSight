import { d as defineEventHandler, u as useRuntimeConfig, g as getRouterParam, c as createError } from './nitro/node-server.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';

const statement_get = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const accountId = getRouterParam(event, "id");
    const response = await $fetch(
      `${config.monoApiUrl}/v1/accounts/${accountId}/statement`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-real-time": true,
          "mono-sec-key": config.monoSecretKey
        },
        method: "GET",
        query: { period: "last12months" }
      }
    );
    return response;
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: err.message
    });
  }
});

export { statement_get as default };
//# sourceMappingURL=statement.get.mjs.map
