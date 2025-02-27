import { User } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;

  try {
    const user = await User.findByPk(userId, { attributes: ['wallet_address', 'balance'] });

    if (!user) {
      throw createError({ statusCode: 404, message: 'کاربر یافت نشد.' });
    }

    return { success: true, wallet: { 
      address: user.wallet_address,
      balance: user.balance
    }};
  } catch (error) {
    console.error('Error fetching wallet info:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت اطلاعات کیف‌پول.',
    });
  }
});
