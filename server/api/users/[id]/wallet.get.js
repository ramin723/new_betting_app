import { User } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id; // گرفتن ID از مسیر

  try {
    const user = await User.findByPk(userId, { attributes: ['wallet_address'] });

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'کاربر یافت نشد.',
      });
    }

    return { success: true, wallet_address: user.wallet_address };
  } catch (error) {
    console.error('Error fetching wallet address:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت آدرس کیف‌پول.',
    });
  }
});
