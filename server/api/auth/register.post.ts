import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { User } from '~/server/models/User';
import { generateToken } from '~/server/utils/jwt';
import { Op } from 'sequelize';
import { USER_ROLES } from '~/server/constants';

// اسکیمای اعتبارسنجی
const registerSchema = z.object({
  username: z.string()
    .min(3, 'نام کاربری باید حداقل 3 کاراکتر باشد')
    .max(20, 'نام کاربری نمی‌تواند بیشتر از 20 کاراکتر باشد'),
  email: z.string()
    .email('ایمیل نامعتبر است'),
  password: z.string()
    .min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد')
    .regex(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد')
    .regex(/[a-z]/, 'رمز عبور باید حداقل یک حرف کوچک داشته باشد')
    .regex(/[0-9]/, 'رمز عبور باید حداقل یک عدد داشته باشد')
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // اعتبارسنجی داده‌ها
    const validatedData = registerSchema.parse(body);
    
    // بررسی وجود کاربر با ایمیل یا نام کاربری مشابه
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    });

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: 'کاربری با این ایمیل یا نام کاربری قبلاً ثبت‌نام کرده است'
      });
    }

    // ایجاد کاربر جدید
    const user = await User.create({
      username: validatedData.username,
      email: validatedData.email,
      password: validatedData.password,
      role: USER_ROLES.USER,
      balance: 0,
      total_referral_earnings: 0,
      isBlocked: false
    });

    // تولید توکن
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email || '',
      role: user.role
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: error.errors[0].message
      });
    }
    
    throw createError({
      statusCode: 500,
      message: 'خطا در ثبت‌نام کاربر'
    });
  }
}); 