import { d as defineEventHandler, u as useRuntimeConfig, g as getRouterParam, c as createError } from './nitro/node-server.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';

const disconnect_post = defineEventHandler(async (event) => {
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
          "mono-sec-key": config.monoSecretKey
        },
        method: "POST"
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

export { disconnect_post as default };
//# sourceMappingURL=disconnect.post.mjs.map
