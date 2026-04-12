// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { scopeDataVisorVite } from './app/vite-plugins/scopeDataVisorVite'

const vBeautifulMermaidCss = fileURLToPath(new URL('./node_modules/v-beautiful-mermaid/dist/client.css', import.meta.url))

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    'nuxt-gtag'
  ],
  ssr: false,

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css', vBeautifulMermaidCss],

  ui: {
    theme: {
      defaultVariants: {
        color: 'neutral'
      }
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/json-xml-formatter': { redirect: '/formatter' },
    '/es/json-xml-formatter': { redirect: '/es/formatter' },
    '/json-xml-yaml-toml-format': { redirect: '/formatter' },
    '/es/json-xml-yaml-toml-format': { redirect: '/es/formatter' }
  },

  compatibilityDate: '2025-01-15',

  vite: {
    plugins: [scopeDataVisorVite()],
    ssr: {
      noExternal: [
        'xml-js',
        'v-beautiful-mermaid',
        'beautiful-mermaid',
        'data-visor-vue'
      ]
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  gtag: {
    id: 'G-E4XDRKDR6E'
  },

  i18n: {
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en.json'
      },
      {
        code: 'es',
        iso: 'es-ES',
        name: 'Español',
        file: 'es.json'
      }
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    langDir: 'locales',
    restructureDir: '',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false
    }
  }
})
