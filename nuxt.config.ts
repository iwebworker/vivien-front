// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
app: {
    head: {
        title: 'Vivien - Женская одежда',
        meta: [
            { name: 'description', content: 'Современный магазин женской одежды' },
            { name: 'theme-color', content: '#f43f5e' }
        ],
        link: [
            { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
        ]
    }
},
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase: 'https://iwebworker-vivien-back-d2e5.twc1.net/api',
      mediaBase: 'https://iwebworker-vivien-back-d2e5.twc1.net'
    }
  }
})
