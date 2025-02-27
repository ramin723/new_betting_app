import { User, WalletHistory } from '../../../../models/database';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;
  const body = await readBody(event);
  const { amount } = body;

  // حداقل و حداکثر مقدار مجاز دپوزیت
  const maxDepositLimit = 10000;

  if (!amount || amount <= 0) {
    throw createError({
      statusCode: 400,
      message: 'مقدار افزایش موجودی باید بیشتر از صفر باشد.',
    });
  }

  if (amount > maxDepositLimit) {
    throw createError({
      statusCode: 400,
      message: `حداکثر مقدار افزایش موجودی ${maxDepositLimit} واحد است.`,
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

    // افزایش موجودی
    user.balance += amount;
    await user.save();

    // ثبت تراکنش در WalletHistory
    await WalletHistory.create({
      user_id: userId,
      wallet_address: user.wallet_address || 'N/A',
      status: 'deposit',
    });

    return { success: true, message: `موجودی ${amount} واحد افزایش یافت.`, balance: user.balance };
  } catch (error) {
    console.error('Error depositing to wallet:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در افزایش موجودی کیف‌پول.',
    });
  }
});
