// server/api/users/[id]/wallet/withdraw.post.js
import { User, Payment } from '../../../../models/database';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;
  const body = await readBody(event);
  const { amount } = body;

  if (!amount || amount <= 0) {
    throw createError({
      statusCode: 400,
      message: 'مقدار برداشت باید بیشتر از صفر باشد.',
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

    if (user.balance < amount) {
      throw createError({
        statusCode: 400,
        message: 'موجودی کافی نیست.',
      });
    }

    user.balance -= amount;
    await user.save();

    await Payment.create({
      user_id: userId,
      amount,
      method: 'withdraw',
      status: 'pending',
    });

    return { success: true, message: 'برداشت با موفقیت ثبت شد. منتظر تایید مدیریت باشید.', balance: user.balance };
  } catch (error) {
    console.error('Error withdrawing from wallet:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در برداشت از کیف‌پول.',
    });
  }
});
