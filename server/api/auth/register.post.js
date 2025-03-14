import { User } from '../../models/database';
import { defineEventHandler, readBody, createError } from 'h3';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  try {
    // فقط در محیط development قابل استفاده است
    if (process.env.NODE_ENV === 'production') {
      throw createError({
        statusCode: 404,
        message: 'این API در محیط production در دسترس نیست.'
      });
    }

    // لاگ کامل درخواست
    console.log('Request headers:', event.node.req.headers);
    
    const body = await readBody(event);
    console.log('Raw request body:', body);

    if (!body) {
      throw createError({
        statusCode: 400,
        message: 'بدنه درخواست خالی است'
      });
    }

    const { username, password, first_name, last_name } = body;
    console.log('Parsed data:', { username, password: '***', first_name, last_name });

    if (!username || !password) {
      throw createError({
        statusCode: 400,
        message: 'نام کاربری و رمز عبور الزامی است.'
      });
    }

    // بررسی تکراری نبودن نام کاربری
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: 'این نام کاربری قبلاً ثبت شده است.'
      });
    }

    // رمزنگاری رمز عبور
    const hashedPassword = await bcrypt.hash(password, 10);

    // ایجاد کاربر جدید
    const user = await User.create({
      username,
      password: hashedPassword,
      first_name,
      last_name,
      role: 'user'
    });

    return {
      success: true,
      message: 'ثبت‌نام با موفقیت انجام شد.',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Registration error:', error); // لاگ خطا
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'خطا در ثبت‌نام کاربر'
    });
  }
}); 