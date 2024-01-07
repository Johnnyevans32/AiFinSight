import { d as defineEventHandler, u as useRuntimeConfig, r as readBody, c as createError } from './nitro/node-server.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';

const connect_post = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const { code } = await readBody(event);
    const response = await $fetch(
      `${config.monoApiUrl}/account/auth`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "mono-sec-key": config.monoSecretKey
        },
        method: "POST",
        body: { code }
      }
    );
    return response.id;
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: err.message
    });
  }
});

export { connect_post as default };
//# sourceMappingURL=connect.post.mjs.map
