import { z } from 'zod';
import { User } from '~/server/models/User';
import { verifyToken } from '~/server/utils/jwt';

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
    
    // دریافت اطلاعات کاربر
    const user = await User.findByPk(decoded.id, {
      attributes: [
        'id',
        'username',
        'email',
        'first_name',
        'last_name',
        'avatar',
        'role',
        'balance',
        'points',
        'total_referral_earnings',
        'telegram_id',
        'wallet_address',
        'created_at'
      ]
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'کاربر یافت نشد'
      });
    }

    return user;
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      throw createError({
        statusCode: 401,
        message: 'توکن نامعتبر است'
      });
    }
    
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت اطلاعات پروفایل'
    });
  }
}); 