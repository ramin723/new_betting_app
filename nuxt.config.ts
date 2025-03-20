import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  // فعال‌سازی رندرینگ سمت سرور
  ssr: true,

  // تنظیمات Nitro برای اجرای پروژه روی Node.js
  nitro: {
    preset: 'node-server',
    plugins: [
      '~/server/plugins/sequelize.js',
      '~/server/middleware/validate',
      '~/server/middleware/cache',
      '~/server/middleware/logger',
      '~/server/middleware/rateLimit'
    ],
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    }
  },

  // تنظیمات عمومی اپلیکیشن
  app: {
    head: {
      title: 'Meem Bet',
      meta: [
        { name: 'description', content: 'A betting platform for trending events' }
      ]
    }
  },

  // تنظیمات runtime
  runtimeConfig: {
    cookieSecret: process.env.COOKIE_SECRET || 'your-secret-key',
    auth: {
      secret: process.env.AUTH_SECRET || 'meem-bet-jwt-secret-2024',
      cookieName: 'auth_token'
    },
    supabase: {
      redirect: false
    },
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:3000'
    }
  },

  // ماژول‌ها
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@sidebase/nuxt-auth'
  ],

  css: [
    'vue-toastification/dist/index.css'
  ],

  build: {
    transpile: ['vue-toastification']
  },

  typescript: {
    strict: true,
    typeCheck: true
  },

  imports: {
    dirs: ['composables', 'composables/*/index.{ts,js,mjs,mts}']
  },

  // تنظیمات alias برای import‌ها
  alias: {
    '@server': '~/server',
    '@plugins': '~/server/plugins',
    '@models': '~/server/models'
  },

  compatibilityDate: '2025-03-09',

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/register', '/reset-password']
    }
  },

  // تنظیمات احراز هویت
  auth: {
    origin: process.env.AUTH_ORIGIN || 'http://localhost:3000',
    enableGlobalAppMiddleware: true,
    session: {
      enableRefreshPeriodically: false,
      enableRefreshOnWindowFocus: true
    }
  }
});