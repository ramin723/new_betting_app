// server/api/users/[id]/wallet/deposit.post.js
import { User } from '../../../../models/database';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;
  const body = await readBody(event);
  const { amount } = body;

  if (!amount || amount <= 0) {
    throw createError({
      statusCode: 400,
      message: 'مقدار افزایش موجودی باید بیشتر از صفر باشد.',
    });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'کاربر یافت نشد.',
      });
    }

    user.balance += amount;
    await user.save();

    return { success: true, message: 'موجودی با موفقیت افزایش یافت.', balance: user.balance };
  } catch (error) {
    console.error('Error depositing to wallet:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در افزایش موجودی کیف‌پول.',
    });
  }
});
