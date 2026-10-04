// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/color-mode', '@nuxtjs/supabase', '@vite-pwa/nuxt'],
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
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', href: '/pwa-icon-source.svg', sizes: 'any', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' },
      ],
    },
  },
  pwa: {
    // Only register service worker in production builds
    devOptions: {
      enabled: false,
    },
    registerType: 'autoUpdate',
    manifest: {
      name: 'Devryte',
      short_name: 'Devryte',
      description: 'A learning workspace to organize topics, lessons and notes.',
      theme_color: '#13131c',
      background_color: '#13131c',
      display: 'standalone',
      orientation: 'portrait-primary',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png',
        },
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      // Network-first: always try the network, fall back to cache when offline
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
      // Explicitly include all PWA icon variants
      additionalManifestEntries: [
        { url: '/pwa-64x64.png', revision: null },
        { url: '/pwa-192x192.png', revision: null },
        { url: '/pwa-512x512.png', revision: null },
        { url: '/maskable-icon-512x512.png', revision: null },
        { url: '/apple-touch-icon-180x180.png', revision: null },
      ],
      runtimeCaching: [
        {
          // App shell & pages — network-first
          urlPattern: ({ request }: { request: Request }) =>
            request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages-cache',
            networkTimeoutSeconds: 5,
            expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
          },
        },
        {
          // Static assets — cache-first (fonts, images, JS, CSS)
          urlPattern: ({ request }: { request: Request }) =>
            ['style', 'script', 'image', 'font'].includes(request.destination),
          handler: 'CacheFirst',
          options: {
            cacheName: 'assets-cache',
            expiration: { maxEntries: 100, maxAgeSeconds: 604800 },
          },
        },
        {
          // Google Fonts — stale-while-revalidate
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: { maxEntries: 10, maxAgeSeconds: 2592000 },
          },
        },
      ],
    },
  },
})

