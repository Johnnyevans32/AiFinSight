import nodePolyfills from "vite-plugin-node-stdlib-browser";

export default defineNuxtConfig({
  app: {
    head: {
      titleTemplate: process.env.APP_NAME,
      title: process.env.APP_NAME,
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
      link: [
        {
          href: "https://db.onlinewebfonts.com/c/ccdb598c7dd2100f5f7a8c1296c1dcfe?family=Farfetch+Basis+Regular",
          rel: "stylesheet",
        },
      ],
    },
  },
  telemetry: false,
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
  ssr: false,
  modules: ["@pinia/nuxt", "@pinia-plugin-persistedstate/nuxt"],
  pinia: {
    storesDirs: ["./stores/**", "./custom-folder/stores/**"],
  },
  build: {
    transpile: ["@headlessui/vue", "@fortawesome/vue-fontawesome"],
  },

  runtimeConfig: {
    public: {
      monoPublicKey: process.env.MONO_PUBLIC_KEY,
      appName: process.env.APP_NAME,
      appDesc: process.env.APP_DESC,
      appContactEmail: process.env.APP_CONTACT_EMAIL,
    },
    monoApiUrl: "",
    monoSecretKey: "",
    openaiApiKey: "",
  },
  vite: {
    plugins: [nodePolyfills()],
  },
});
