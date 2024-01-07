import { d as defineEventHandler, c as createError } from './nitro/node-server.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';

const banks_get = defineEventHandler(async (event) => {
  try {
    const response = await $fetch(`https://nigerianbanks.xyz`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "GET"
    });
    return response;
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: err.message
    });
  }
});

export { banks_get as default };
//# sourceMappingURL=banks.get.mjs.map
