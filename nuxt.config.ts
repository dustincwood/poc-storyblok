import mkcert from "vite-plugin-mkcert";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    [
      "@storyblok/nuxt",
      {
        accessToken: process.env.STORYBLOK_DELIVERY_API_TOKEN,
        apiOptions: {
          region: "eu",
        },
      },
    ],
  ],
  // Light only, like usu.edu: with color mode on, a visitor's dark-mode preference switched Nuxt UI's
  // text to its light dark-mode color while main.css keeps the background white
  ui: {
    colorMode: false,
  },
  devServer: {
    https: true,
  },
  vite: {
    plugins: [mkcert()],
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
})
