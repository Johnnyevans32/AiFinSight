import { d as defineEventHandler, u as useRuntimeConfig, g as getRouterParam, c as createError } from './nitro/node-server.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';

const detail_get = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const accountId = getRouterParam(event, "id");
    const response = await $fetch(
      `${config.monoApiUrl}/v1/accounts/${accountId}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-real-time": true,
          "mono-sec-key": config.monoSecretKey
        },
        method: "GET"
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

export { detail_get as default };
//# sourceMappingURL=detail.get.mjs.map
