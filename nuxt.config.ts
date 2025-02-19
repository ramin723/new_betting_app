export default defineNuxtConfig({
  // فعال‌سازی رندرینگ سمت سرور
  ssr: true,

  // تنظیم مسیرهای اصلی
  srcDir: './',

  // اضافه کردن فایل‌های CSS (در صورت نیاز بعداً اضافه می‌شود)
  css: [],

  // پلاگین‌هایی که در آینده اضافه می‌شوند
  plugins: [],

  // ماژول‌هایی که در طول پروژه به آنها نیاز پیدا می‌کنیم
  modules: [],

  // تنظیمات Nitro برای اجرای پروژه روی Node.js
  nitro: {
    preset: 'node-server', // اجرای پروژه در محیط Node.js
    plugins: ['~/server/plugins/sequelize.js'], // اضافه کردن پلاگین دیتابیس
  },

  // تنظیمات عمومی اپلیکیشن
  app: {
    head: {
      title: 'Meem Bet', // عنوان پیش‌فرض صفحات
      meta: [
        { name: 'description', content: 'A betting platform for trending events' },
      ],
    },
  },

  // تاریخ سازگاری پروژه
  compatibilityDate: '2025-01-18',
});
