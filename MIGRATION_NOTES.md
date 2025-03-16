# یادداشت‌های مهاجرت

## درس‌های آموخته شده
1. **اهمیت مطالعه کد قبلی**:
   - بررسی دقیق ساختار قبلی قبل از شروع مهاجرت
   - شناسایی تمام موجودیت‌ها و روابط آنها
   - درک منطق کسب و کار پیاده‌سازی شده
   - جلوگیری از کشف تدریجی وابستگی‌ها در حین کار

2. **مزایای تحلیل اولیه**:
   - کاهش ریسک از دست دادن عملکردها
   - طراحی بهتر interface‌ها از ابتدا
   - پیش‌بینی نیازهای آینده
   - کاهش نیاز به بازنویسی کد

3. **روش بهبود یافته**:
   - مستندسازی کامل ساختار قبلی
   - ترسیم نمودار ارتباطات بین موجودیت‌ها
   - لیست کردن تمام عملکردها و منطق‌های کسب و کار
   - برنامه‌ریزی مهاجرت بر اساس وابستگی‌ها

## فایل‌های قدیمی که باید حذف شوند
پس از اطمینان از عملکرد صحیح فایل‌های جدید، فایل‌های زیر باید حذف شوند:

1. `server/models/database.js`
   - جایگزین شده توسط:
     - `server/plugins/sequelize.ts` (تنظیمات Sequelize)
     - `server/models/types/*.ts` (تعاریف TypeScript)
     - `server/models/*.ts` (پیاده‌سازی مدل‌ها)

2. `server/plugins/sequelize.js`
   - جایگزین شده توسط:
     - `server/plugins/sequelize.ts`

3. `server/models/sequelize.js`
   - جایگزین شده توسط:
     - `server/plugins/sequelize.ts`

## تغییرات ساختاری
1. **جداسازی تنظیمات**:
   - تنظیمات Sequelize به `server/plugins/sequelize.ts` منتقل شد
   - تنظیمات پایگاه داده به `server/config/database.ts` منتقل شد
   - ثابت‌ها به `server/constants/constants.ts` منتقل شدند

2. **جداسازی مدل‌ها**:
   - هر مدل در فایل جداگانه قرار می‌گیرد
   - تعاریف TypeScript در پوشه `types` قرار می‌گیرند
   - پیاده‌سازی‌ها در پوشه اصلی `models` قرار می‌گیرند

3. **تغییرات مسیرها**:
   - مسیرهای import باید به‌روزرسانی شوند
   - از مسیرهای نسبی استفاده شود
   - از پسوند `.ts` استفاده شود

## نکات مهم
1. قبل از حذف فایل‌های قدیمی:
   - تمام تست‌ها باید اجرا شوند
   - عملکرد سیستم باید تأیید شود
   - از داده‌های موجود پشتیبان تهیه شود

2. تغییرات در حال انجام:
   - [x] به‌روزرسانی مسیرهای import در User.ts
   - [x] پیاده‌سازی مدل Bet و interface‌های مربوطه
   - [x] پیاده‌سازی مدل Option و interface‌های مربوطه
   - [x] تکمیل متد calculateWinnings در مدل Bet
   - [ ] به‌روزرسانی مسیرهای import در سایر فایل‌ها
   - [ ] تست عملکرد مدل‌های جدید
   - [ ] تأیید سازگاری با داده‌های موجود
   - [ ] به‌روزرسانی مستندات

3. فایل‌های جدید ایجاد شده:
   - [x] `server/plugins/sequelize.ts`
   - [x] `server/config/database.ts`
   - [x] `server/constants/constants.ts`
   - [x] `server/models/types/*.ts`
   - [x] `server/models/*.ts`
   - [x] `server/models/types/BetInterface.ts`
   - [x] `server/models/Bet.ts`
   - [x] `server/models/types/OptionInterface.ts`
   - [x] `server/models/Option.ts`

## مشکلات شناسایی شده
1. خط‌های کمرنگ در `User.ts`:
   - مشکل: مسیرهای import نادرست
   - راه حل: به‌روزرسانی مسیرها مطابق ساختار جدید

2. تداخل در تنظیمات Sequelize:
   - مشکل: وجود چندین فایل تنظیمات
   - راه حل: یکپارچه‌سازی در `sequelize.ts`

## بررسی دقیق فایل‌های sequelize

### `server/plugins/sequelize.js` (فایل قدیمی)
- کارکردها:
  - Nitro Plugin برای همگام‌سازی دیتابیس در شروع سرور
  - استفاده از تابع `syncDatabase`
  - مدیریت خطاها و لاگینگ

### `server/models/sequelize.js` (فایل قدیمی)
- کارکردها:
  - تعریف تابع `syncDatabase`
  - تست اتصال به دیتابیس
  - همگام‌سازی با حفظ داده‌های قبلی
  - تنظیمات دقیق همگام‌سازی
  - لاگینگ پیشرفته

### `server/plugins/sequelize.ts` (فایل جدید)
- کارکردهای موجود:
  - تنظیمات اتصال به دیتابیس
  - تابع `testConnection`
  - تابع `syncModels`
  - لاگینگ پیشرفته
  - Nitro Plugin برای همگام‌سازی در شروع سرور
  - مدیریت خطاها با type safety

- نیاز به پیاده‌سازی:
  - [x] تبدیل به Nitro Plugin
  - [x] بهبود سیستم لاگینگ
  - [x] اضافه کردن گزینه‌های دقیق‌تر همگام‌سازی
  - [x] مدیریت بهتر خطاها

### مراحل انتقال
1. به‌روزرسانی فایل جدید:
   - اضافه کردن ویژگی‌های لاگینگ از فایل قدیمی
   - اضافه کردن تنظیمات همگام‌سازی
   - پیاده‌سازی Nitro Plugin

2. تست و اطمینان:
   - تست اتصال به دیتابیس
   - تست همگام‌سازی مدل‌ها
   - بررسی لاگ‌ها
   - تست خطاها

3. حذف فایل‌های قدیمی:
   - فقط پس از اطمینان از عملکرد صحیح فایل جدید
   - پشتیبان‌گیری از کدهای مهم

## مراحل بعدی
1. تکمیل متد `calculateWinnings` در مدل Bet
2. پیاده‌سازی روابط Sequelize بین مدل‌ها
3. نوشتن تست‌ها برای مدل‌های جدید
4. بررسی عملکرد هوک‌ها

## به‌روزرسانی‌های انجام شده در User.ts
1. مسیرهای import:
   - [x] `sequelize` از `../plugins/sequelize`
   - [x] `USER_ROLES` و `SECURITY` از `../constants/constants`
   - [x] Interface‌ها از `./types/UserInterface`

2. بهبود Type Safety:
   - [x] استفاده از `SECURITY.TOKEN_EXPIRY` به جای مقدار ثابت
   - [x] اضافه کردن نوع برگشتی `Promise<void>` برای هوک‌ها
   - [x] استفاده از type `User` در پارامترهای هوک‌ها

3. تست‌های مورد نیاز:
   - [ ] تست تولید توکن با تنظیمات جدید
   - [ ] تست هوک‌های به‌روز شده
   - [ ] تست سازگاری با سایر بخش‌های سیستم 

## Completed Tasks
- Added `tsconfig.server.json` for server-side TypeScript configuration
- Updated import paths in `User.ts` to use absolute imports with `@/` prefix

## Implementation Needs
- Test if TypeScript configuration resolves import issues in other server files
- Consider updating other import paths to use absolute imports for consistency

## Important Notes
- Server-side TypeScript configuration is now separate from Nuxt's TypeScript config
- Use absolute imports with `@/` prefix for server-side code 

## پیاده‌سازی‌های انجام شده
1. مدل User:
   - [x] Interface‌ها و type‌ها
   - [x] پیاده‌سازی مدل
   - [x] متدهای کمکی (comparePassword, generateToken)
   - [x] هوک‌های before create/update

2. مدل Bet:
   - [x] Interface‌ها و type‌ها
   - [x] پیاده‌سازی مدل
   - [x] متدهای کمکی (isWinnable, calculateWinnings)
   - [x] روابط با User و Event
   - [x] هوک‌های محاسبه potential_win_amount
   - [x] تکمیل متد calculateWinnings با در نظر گرفتن:
     - ضرایب گزینه‌ها
     - کمیسیون‌های سازنده و معرف
     - وضعیت شرط‌بندی و رویداد

3. مدل Option:
   - [x] Interface‌ها و type‌ها
   - [x] پیاده‌سازی مدل
   - [x] متدهای کمکی
   - [x] روابط با Event
   - [x] اعتبارسنجی‌های مناسب برای odds و مقادیر عددی

## نکات پیاده‌سازی
1. محاسبه مبلغ برد:
   - بررسی وضعیت شرط‌بندی (فقط ACTIVE)
   - بررسی امکان شرط‌بندی در رویداد
   - محاسبه بر اساس ضریب گزینه
   - کسر کمیسیون‌های سازنده و معرف
   - گرد کردن به دو رقم اعشار

2. بهبودهای اضافه شده:
   - اعتبارسنجی حداقل مقدار برای odds
   - شاخص‌های مناسب برای جستجو
   - نوع‌های TypeScript دقیق‌تر
   - مستندسازی با کامنت‌های فارسی

## مراحل بعدی
1. پیاده‌سازی روابط Sequelize بین مدل‌ها
2. نوشتن تست‌ها برای مدل‌های جدید
3. بررسی عملکرد هوک‌ها
4. تست یکپارچگی محاسبات مالی 

# نقشه ذهنی کد قدیمی

## مدل‌های اصلی و روابط آنها

### 1. مدل User
- **فیلدهای کلیدی**: 
  - `id`, `username`, `telegram_id`, `email`, `password`, `balance`, `wallet_address`
  - `isBlocked`, `total_referral_earnings`, `role`
- **روابط**:
  - `hasMany(Bet)`
  - `hasMany(WalletHistory)`
  - `hasMany(Event)` (به عنوان سازنده)

### 2. مدل Event
- **فیلدهای کلیدی**:
  - `id`, `title`, `description`, `event_type`, `question`
  - `result_time`, `betting_deadline`, `start_time`, `end_time`
  - `status`, `total_pool`, `commission_creator`, `commission_referral`
  - `template_id`, `is_featured`
- **متدهای مهم**:
  - `calculatePotentialWinnings(betAmount, optionId)`
  - `isActive()`, `canAcceptBets()`
  - `updateTotalPool()`
- **روابط**:
  - `belongsTo(User)` (سازنده)
  - `hasMany(Bet)`
  - `belongsTo(EventTemplate)`
  - `hasMany(Option)`

### 3. مدل Bet
- **فیلدهای کلیدی**:
  - `id`, `user_id`, `event_id`, `option_id`
  - `bet_amount`, `status`, `potential_win_amount`
- **روابط**:
  - `belongsTo(User)`
  - `belongsTo(Event)`
  - `belongsTo(Option)`

### 4. مدل Option
- **فیلدهای کلیدی**:
  - `id`, `event_id`, `text`, `value`, `odds`
  - `total_bets`, `total_amount`, `is_winner`, `order`
- **روابط**:
  - `belongsTo(Event)`
  - `hasMany(Bet)`

### 5. مدل WalletHistory
- **فیلدهای کلیدی**:
  - `id`, `user_id`, `amount`, `type`, `status`
  - `old_balance`, `new_balance`, `wallet_address`
  - `event_id`, `bet_id`, `metadata`
- **انواع تراکنش**: 
  - `deposit`, `withdraw`, `bet`, `win`, `commission`, `refund`
- **وضعیت‌ها**:
  - `pending`, `completed`, `failed`, `cancelled`
- **روابط**:
  - `belongsTo(User)`
  - `hasOne(Transaction)`

### 6. مدل Transaction
- **فیلدهای کلیدی**:
  - `id`, `wallet_history_id`, `tx_hash`, `block_number`
  - `ton_amount`, `usd_amount`, `sender_address`, `receiver_address`
  - `status`, `confirmation_count`, `raw_data`
- **روابط**:
  - `belongsTo(WalletHistory)`

### 7. مدل EventTemplate
- **فیلدهای کلیدی**:
  - `id`, `name`, `type`, `question_template`
  - `default_deadline_hours`, `required_fields`, `is_active`
- **روابط**:
  - `hasMany(Event)`

## جریان‌های کلیدی کسب و کار

### 1. مدیریت شرط‌بندی
1. کاربر یک رویداد فعال را انتخاب می‌کند
2. مبلغ شرط و گزینه مورد نظر را انتخاب می‌کند
3. سیستم مبلغ احتمالی برد را محاسبه می‌کند
4. شرط ثبت می‌شود و تراکنش کیف پول ایجاد می‌شود
5. پس از مشخص شدن نتیجه، مبلغ برد (در صورت برنده شدن) پرداخت می‌شود

### 2. مدیریت کیف پول
1. کاربر درخواست واریز/برداشت می‌دهد
2. تراکنش در WalletHistory ثبت می‌شود
3. در صورت نیاز به تراکنش بلاکچین، یک رکورد Transaction ایجاد می‌شود
4. پس از تایید تراکنش، موجودی کاربر به‌روز می‌شود

### 3. سیستم کمیسیون
- کمیسیون سازنده رویداد: 2%
- کمیسیون معرف: 5%
- کمیسیون‌ها در زمان تسویه شرط‌ها محاسبه و پرداخت می‌شوند

## نکات مهم برای مهاجرت
1. حفظ سازگاری با داده‌های موجود
2. اطمینان از صحت محاسبات مالی
3. حفظ امنیت در تراکنش‌های کیف پول
4. پشتیبانی از انواع مختلف رویداد
5. مدیریت صحیح وضعیت‌های مختلف تراکنش‌ها 

## تغییرات اخیر

### تنظیمات TypeScript و Import‌ها
1. ✅ اصلاح `tsconfig.server.json` برای پشتیبانی از مسیرهای Nuxt 3
2. ✅ اضافه کردن مسیرهای `#imports`، `#nitro`، `#app` و `#head`
3. ❌ استفاده از `#imports` برای دسترسی به `sequelize` - نیاز به تغییر رویکرد
4. ✅ بازگشت به استفاده از مسیرهای نسبی برای import‌های سمت سرور

### درس‌های آموخته شده در مورد Import‌ها
1. مسیرهای `#imports` برای کدهای سمت سرور به درستی کار نمی‌کنند
2. بهتر است از مسیرهای نسبی برای کدهای سمت سرور استفاده کنیم
3. مسیرهای مطلق (`@/` و `~/`) را برای کامپوننت‌ها و کدهای سمت کلاینت نگه داریم

### به‌روزرسانی مدل‌ها
1. ✅ اصلاح import‌ها در `User.ts` برای استفاده از مسیرهای نسبی
2. ⬜️ به‌روزرسانی سایر مدل‌ها با همین رویکرد
3. ⬜️ تست عملکرد مدل‌ها با تنظیمات جدید

## به‌روزرسانی‌های انجام شده در User.ts
1. مسیرهای import:
   - [x] `sequelize` از `../plugins/sequelize`
   - [x] `USER_ROLES` و `SECURITY` از `../constants/constants`
   - [x] Interface‌ها از `./types/UserInterface`

2. بهبود Type Safety:
   - [x] استفاده از `SECURITY.TOKEN_EXPIRY` به جای مقدار ثابت
   - [x] اضافه کردن نوع برگشتی `Promise<void>` برای هوک‌ها
   - [x] استفاده از type `User` در پارامترهای هوک‌ها

3. تست‌های مورد نیاز:
   - [ ] تست تولید توکن با تنظیمات جدید
   - [ ] تست هوک‌های به‌روز شده
   - [ ] تست سازگاری با سایر بخش‌های سیستم 

## Completed Tasks
- Added `tsconfig.server.json` for server-side TypeScript configuration
- Updated import paths in `User.ts` to use absolute imports with `@/` prefix

## Implementation Needs
- Test if TypeScript configuration resolves import issues in other server files
- Consider updating other import paths to use absolute imports for consistency

## Important Notes
- Server-side TypeScript configuration is now separate from Nuxt's TypeScript config
- Use absolute imports with `@/` prefix for server-side code 

## پیاده‌سازی‌های انجام شده
1. مدل User:
   - [x] Interface‌ها و type‌ها
   - [x] پیاده‌سازی مدل
   - [x] متدهای کمکی (comparePassword, generateToken)
   - [x] هوک‌های before create/update

2. مدل Bet:
   - [x] Interface‌ها و type‌ها
   - [x] پیاده‌سازی مدل
   - [x] متدهای کمکی (isWinnable, calculateWinnings)
   - [x] روابط با User و Event
   - [x] هوک‌های محاسبه potential_win_amount
   - [x] تکمیل متد calculateWinnings با در نظر گرفتن:
     - ضرایب گزینه‌ها
     - کمیسیون‌های سازنده و معرف
     - وضعیت شرط‌بندی و رویداد

3. مدل Option:
   - [x] Interface‌ها و type‌ها
   - [x] پیاده‌سازی مدل
   - [x] متدهای کمکی
   - [x] روابط با Event
   - [x] اعتبارسنجی‌های مناسب برای odds و مقادیر عددی

## نکات پیاده‌سازی
1. محاسبه مبلغ برد:
   - بررسی وضعیت شرط‌بندی (فقط ACTIVE)
   - بررسی امکان شرط‌بندی در رویداد
   - محاسبه بر اساس ضریب گزینه
   - کسر کمیسیون‌های سازنده و معرف
   - گرد کردن به دو رقم اعشار

2. بهبودهای اضافه شده:
   - اعتبارسنجی حداقل مقدار برای odds
   - شاخص‌های مناسب برای جستجو
   - نوع‌های TypeScript دقیق‌تر
   - مستندسازی با کامنت‌های فارسی

## مراحل بعدی
1. پیاده‌سازی روابط Sequelize بین مدل‌ها
2. نوشتن تست‌ها برای مدل‌های جدید
3. بررسی عملکرد هوک‌ها
4. تست یکپارچگی محاسبات مالی 

# نقشه ذهنی کد قدیمی

## مدل‌های اصلی و روابط آنها

### 1. مدل User
- **فیلدهای کلیدی**: 
  - `id`, `username`, `telegram_id`, `email`, `password`, `balance`, `wallet_address`
  - `isBlocked`, `total_referral_earnings`, `role`
- **روابط**:
  - `hasMany(Bet)`
  - `hasMany(WalletHistory)`
  - `hasMany(Event)` (به عنوان سازنده)

### 2. مدل Event
- **فیلدهای کلیدی**:
  - `id`, `title`, `description`, `event_type`, `question`
  - `result_time`, `betting_deadline`, `start_time`, `end_time`
  - `status`, `total_pool`, `commission_creator`, `commission_referral`
  - `template_id`, `is_featured`
- **متدهای مهم**:
  - `calculatePotentialWinnings(betAmount, optionId)`
  - `isActive()`, `canAcceptBets()`
  - `updateTotalPool()`
- **روابط**:
  - `belongsTo(User)` (سازنده)
  - `hasMany(Bet)`
  - `belongsTo(EventTemplate)`
  - `hasMany(Option)`

### 3. مدل Bet
- **فیلدهای کلیدی**:
  - `id`, `user_id`, `event_id`, `option_id`
  - `bet_amount`, `status`, `potential_win_amount`
- **روابط**:
  - `belongsTo(User)`
  - `belongsTo(Event)`
  - `belongsTo(Option)`

### 4. مدل Option
- **فیلدهای کلیدی**:
  - `id`, `event_id`, `text`, `value`, `odds`
  - `total_bets`, `total_amount`, `is_winner`, `order`
- **روابط**:
  - `belongsTo(Event)`
  - `hasMany(Bet)`

### 5. مدل WalletHistory
- **فیلدهای کلیدی**:
  - `id`, `user_id`, `amount`, `type`, `status`
  - `old_balance`, `new_balance`, `wallet_address`
  - `event_id`, `bet_id`, `metadata`
- **انواع تراکنش**: 
  - `deposit`, `withdraw`, `bet`, `win`, `commission`, `refund`
- **وضعیت‌ها**:
  - `pending`, `completed`, `failed`, `cancelled`
- **روابط**:
  - `belongsTo(User)`
  - `hasOne(Transaction)`

### 6. مدل Transaction
- **فیلدهای کلیدی**:
  - `id`, `wallet_history_id`, `tx_hash`, `block_number`
  - `ton_amount`, `usd_amount`, `sender_address`, `receiver_address`
  - `status`, `confirmation_count`, `raw_data`
- **روابط**:
  - `belongsTo(WalletHistory)`

### 7. مدل EventTemplate
- **فیلدهای کلیدی**:
  - `id`, `name`, `type`, `question_template`
  - `default_deadline_hours`, `required_fields`, `is_active`
- **روابط**:
  - `hasMany(Event)`

## جریان‌های کلیدی کسب و کار

### 1. مدیریت شرط‌بندی
1. کاربر یک رویداد فعال را انتخاب می‌کند
2. مبلغ شرط و گزینه مورد نظر را انتخاب می‌کند
3. سیستم مبلغ احتمالی برد را محاسبه می‌کند
4. شرط ثبت می‌شود و تراکنش کیف پول ایجاد می‌شود
5. پس از مشخص شدن نتیجه، مبلغ برد (در صورت برنده شدن) پرداخت می‌شود

### 2. مدیریت کیف پول
1. کاربر درخواست واریز/برداشت می‌دهد
2. تراکنش در WalletHistory ثبت می‌شود
3. در صورت نیاز به تراکنش بلاکچین، یک رکورد Transaction ایجاد می‌شود
4. پس از تایید تراکنش، موجودی کاربر به‌روز می‌شود

### 3. سیستم کمیسیون
- کمیسیون سازنده رویداد: 2%
- کمیسیون معرف: 5%
- کمیسیون‌ها در زمان تسویه شرط‌ها محاسبه و پرداخت می‌شوند

## نکات مهم برای مهاجرت
1. حفظ سازگاری با داده‌های موجود
2. اطمینان از صحت محاسبات مالی
3. حفظ امنیت در تراکنش‌های کیف پول
4. پشتیبانی از انواع مختلف رویداد
5. مدیریت صحیح وضعیت‌های مختلف تراکنش‌ها 