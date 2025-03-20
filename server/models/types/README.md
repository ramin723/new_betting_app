# رابط‌های TypeScript

این پوشه شامل تمام رابط‌های TypeScript مورد نیاز برای مدل‌های سیستم شرط‌بندی است.

## ساختار رابط‌ها

### UserInterface
تعریف خصوصیات و متدهای مربوط به مدل کاربران.

### EventInterface
تعریف خصوصیات و متدهای مربوط به مدل رویدادها.

### BetInterface
تعریف خصوصیات و متدهای مربوط به مدل شرط‌ها.

### WalletHistoryInterface
تعریف خصوصیات و متدهای مربوط به مدل تاریخچه تراکنش‌ها.

### TagInterface
تعریف خصوصیات و متدهای مربوط به مدل برچسب‌ها.

### EventTemplateInterface
تعریف خصوصیات و متدهای مربوط به مدل قالب‌های رویداد.

### OptionInterface
تعریف خصوصیات و متدهای مربوط به مدل گزینه‌های شرط‌بندی.

## ساختار هر رابط

هر رابط شامل موارد زیر است:

1. `Attributes`: تعریف خصوصیات اصلی مدل
2. `Model`: تعریف متدهای مدل و خصوصیات آن
3. `CreateInput`: تعریف فیلدهای مورد نیاز برای ایجاد یک رکورد جدید
4. `UpdateInput`: تعریف فیلدهای اختیاری برای به‌روزرسانی یک رکورد
5. `Response`: تعریف ساختار پاسخ API

## مثال استفاده

```typescript
// تعریف یک متغیر با نوع UserAttributes
const userData: UserAttributes = {
  username: 'test_user',
  email: 'test@example.com',
  password: 'hashed_password',
  role: 'user'
};

// تعریف یک متغیر با نوع CreateUserInput
const newUser: CreateUserInput = {
  username: 'new_user',
  email: 'new@example.com',
  password: 'password123'
};

// تعریف یک متغیر با نوع UpdateUserInput
const updateData: UpdateUserInput = {
  email: 'updated@example.com'
};
```

## نکات مهم

1. همه رابط‌ها از `Model` Sequelize ارث‌بری می‌کنند.
2. از `keyof typeof` برای تعریف انواع enum استفاده شده است.
3. از `Omit` و `Partial` برای تعریف انواع ورودی استفاده شده است.
4. روابط بین مدل‌ها در متدهای رابط‌ها تعریف شده‌اند.

## تست‌ها

برای اجرای تست‌های تایپ‌اسکریپت:

```bash
npm run type-check
```

## مستندات بیشتر

برای اطلاعات بیشتر درباره هر رابط، به فایل مربوطه مراجعه کنید. 