import { User } from '../../models/database';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password, wallet_address } = body;

  // بررسی ورودی‌ها
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: 'نام کاربری و رمز عبور الزامی هستند.',
    });
  }

  // قوانین رمز عبور قوی
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw createError({
      statusCode: 400,
      message: 'رمز عبور باید حداقل 8 کاراکتر، یک حرف بزرگ و یک عدد داشته باشد.',
    });
  }

  // بررسی فرمت آدرس کیف‌پول
  if (wallet_address && !/^((0:[a-fA-F0-9]{64})|([a-zA-Z0-9_-]{48,66}))$/.test(wallet_address)) {
    throw createError({
      statusCode: 400,
      message: 'آدرس کیف‌پول نامعتبر است.',
    });
  }

  // بررسی یکتایی آدرس کیف‌پول
  if (wallet_address) {
    const existingWallet = await User.findOne({ where: { wallet_address } });
    if (existingWallet) {
      throw createError({
        statusCode: 400,
        message: 'این آدرس کیف‌پول قبلاً استفاده شده است.',
      });
    }
  }

  // بررسی نام کاربری تکراری
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: 'این نام کاربری قبلاً ثبت شده است.',
    });
  }

  // هش کردن رمز عبور
  const hashedPassword = await bcrypt.hash(password, 10);

  // ایجاد کاربر جدید
  const user = await User.create({
    username,
    password: hashedPassword,
    wallet_address,
  });

  return { success: true, message: 'ثبت‌نام موفقیت‌آمیز بود.', user };
});
