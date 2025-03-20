# پروژه شرط‌بندی

## معرفی
این پروژه یک پلتفرم شرط‌بندی آنلاین است که با استفاده از Nuxt 3 و TypeScript توسعه داده شده است. این پروژه شامل قابلیت‌های مختلفی مانند مدیریت رویدادها، شرط‌بندی، کیف پول و سیستم اعلان‌ها است.

## ویژگی‌های اصلی
- احراز هویت کاربران با JWT
- مدیریت رویدادها و شرط‌بندی
- سیستم کیف پول و تراکنش‌ها
- سیستم اعلان‌ها
- کش‌سازی با Redis
- محدودیت نرخ درخواست‌ها
- اعتبارسنجی داده‌ها با Zod
- لاگینگ با Winston

## پیش‌نیازها
- Node.js (نسخه 18 یا بالاتر)
- PostgreSQL
- Redis
- pnpm (پیشنهاد شده)

## نصب و راه‌اندازی

1. نصب وابستگی‌ها:
```bash
pnpm install
```

2. تنظیم متغیرهای محیطی:
```bash
cp .env.example .env
```

3. تنظیمات فایل `.env`:
```env
# Database
DB_URL=postgresql://user:password@localhost:5432/betting_app

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key

# Server
PORT=3000
NODE_ENV=development
```

4. اجرای مایگریشن‌ها:
```bash
pnpm prisma migrate dev
```

5. اجرای پروژه:
```bash
pnpm dev
```

## ساختار پروژه

```
├── server/
│   ├── api/              # API endpoints
│   ├── config/           # تنظیمات پروژه
│   ├── constants/        # ثابت‌ها
│   ├── middleware/       # میدلویرها
│   ├── models/          # مدل‌های دیتابیس
│   └── utils/           # توابع کمکی
├── pages/               # صفحات فرانت‌اند
├── components/          # کامپوننت‌ها
└── public/             # فایل‌های استاتیک
```

## API‌های موجود

### احراز هویت
- `POST /api/auth/register` - ثبت‌نام کاربر جدید
- `POST /api/auth/login` - ورود کاربر
- `POST /api/auth/logout` - خروج کاربر
- `GET /api/auth/profile` - دریافت پروفایل کاربر

### رویدادها
- `GET /api/events` - دریافت لیست رویدادها
- `GET /api/events/:id` - دریافت جزئیات یک رویداد
- `POST /api/events` - ایجاد رویداد جدید
- `PUT /api/events/:id` - به‌روزرسانی رویداد
- `DELETE /api/events/:id` - حذف رویداد

### شرط‌بندی
- `POST /api/bets` - ثبت شرط جدید
- `GET /api/bets` - دریافت لیست شرط‌های کاربر
- `GET /api/bets/:id` - دریافت جزئیات یک شرط

### کیف پول
- `GET /api/wallet` - دریافت اطلاعات کیف پول
- `POST /api/wallet/deposit` - واریز به کیف پول
- `POST /api/wallet/withdraw` - برداشت از کیف پول
- `GET /api/wallet/history` - دریافت تاریخچه تراکنش‌ها

### اعلان‌ها
- `GET /api/notifications` - دریافت لیست اعلان‌ها
- `POST /api/notifications/read` - علامت‌گذاری اعلان‌ها به عنوان خوانده شده

### گزارش‌ها
- `GET /api/reports` - دریافت گزارش‌های کلی
- `GET /api/reports/analytics` - دریافت گزارش‌های تحلیلی

## امنیت
- احراز هویت با JWT
- محدودیت نرخ درخواست‌ها
- اعتبارسنجی داده‌ها
- محافظت در برابر حملات XSS و CSRF

## توسعه
- استفاده از TypeScript برای type safety
- ESLint و Prettier برای فرمت‌بندی کد
- Jest برای تست‌ها
- Docker برای توسعه و استقرار

## استقرار
1. ساخت پروژه:
```bash
pnpm build
```

2. اجرای پروژه:
```bash
pnpm start
```

## تست
```bash
pnpm test
```

## مشارکت
1. Fork پروژه
2. ایجاد branch جدید
3. اعمال تغییرات
4. ارسال Pull Request

## لایسنس
MIT
