import { z } from 'zod';
import { User } from '~/server/models/User';
import { verifyToken } from '~/server/utils/jwt';

const updateProfileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  telegram_id: z.string().optional(),
  wallet_address: z.string().optional()
});

export default defineEventHandler(async (event) => {
  try {
    // دریافت توکن از هدر
    const token = event.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      throw createError({
        statusCode: 401,
        message: 'توکن احراز هویت یافت نشد'
      });
    }

    // اعتبارسنجی توکن
    const decoded = verifyToken(token);
    
    // دریافت و اعتبارسنجی داده‌های ارسالی
    const body = await readBody(event);
    const validatedData = updateProfileSchema.parse(body);

    // به‌روزرسانی اطلاعات کاربر
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'کاربر یافت نشد'
      });
    }

    await user.update(validatedData);

    return {
      message: 'پروفایل با موفقیت به‌روزرسانی شد',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar: user.avatar,
        role: user.role,
        balance: user.balance,
        points: user.points,
        total_referral_earnings: user.total_referral_earnings,
        telegram_id: user.telegram_id,
        wallet_address: user.wallet_address,
        createdAt: user.createdAt
      }
    };
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      throw createError({
        statusCode: 401,
        message: 'توکن نامعتبر است'
      });
    }

    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'داده‌های ارسالی نامعتبر هستند'
      });
    }
    
    throw createError({
      statusCode: 500,
      message: 'خطا در به‌روزرسانی پروفایل'
    });
  }
}); 