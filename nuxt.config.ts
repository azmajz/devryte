// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/color-mode', '@nuxtjs/supabase'],
  supabase: {
    redirect: false
  },
  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark',
    dataValue: 'theme',
    storageKey: 'nuxt-color-mode',
  },
  css: ['~/assets/css/main.css', 'highlight.js/styles/github-dark-dimmed.css'],
  app: {
    head: {
      title: 'Devryte — Learning Workspace',
      meta: [
        { name: 'description', content: 'Devryte is a learning workspace to organize topics, lessons.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap' },
      ],
    },
  },
})
