import nodePolyfills from "vite-plugin-node-stdlib-browser";

export default defineNuxtConfig({
  app: {
    head: {
      titleTemplate: "AiFinSight",
      title: "aifinsight",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          hid: "description",
          name: "description",
          content: "your decentralised financial companion",
        },
        { name: "format-detection", content: "telephone=no" },
      ],
    },
  },
  css: [
    "~/assets/css/styles.css",
    "@fortawesome/fontawesome-svg-core/styles.css",
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: [
    // ...
    "@pinia/nuxt",
  ],
  pinia: {
    storesDirs: ["./stores/**", "./custom-folder/stores/**"],
  },
  build: {
    transpile:
      process.env.SSR === "enabled"
        ? ["@headlessui/vue", "vue-clipboard3"]
        : ["@headlessui/vue"],
  },
  ssr: process.env.SSR === "enabled",
  runtimeConfig: {
    public: {
      monoPublicKey: process.env.MONO_PUBLIC_KEY,
      appName: process.env.APP_NAME,
      appDesc: process.env.APP_DESC,
    },
    monoApiUrl: "",
    monoSecretKey: "",
  },
  vite: {
    plugins: [nodePolyfills()],
  },
});
