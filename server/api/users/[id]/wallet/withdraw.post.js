import { User, Payment, WalletHistory } from '../../../../models/database';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;
  const body = await readBody(event);
  const { amount } = body;

  // حداقل و حداکثر مقدار مجاز برداشت
  const maxWithdrawLimit = 5000;

  if (!amount || amount <= 0) {
    throw createError({
      statusCode: 400,
      message: 'مقدار برداشت باید بیشتر از صفر باشد.',
    });
  }

  if (amount > maxWithdrawLimit) {
    throw createError({
      statusCode: 400,
      message: `حداکثر مقدار برداشت ${maxWithdrawLimit} واحد است.`,
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

    // کاهش موجودی کاربر (اما تا تأیید نهایی هنوز از کیف پول خارج نشده)
    user.balance -= amount;
    await user.save();

    // ثبت درخواست برداشت در Payment
    const payment = await Payment.create({
      user_id: userId,
      amount,
      method: 'withdraw',
      status: 'pending',
    });

    // ثبت تراکنش در WalletHistory
    await WalletHistory.create({
      user_id: userId,
      wallet_address: user.wallet_address || 'N/A',
      status: 'withdraw_pending',
    });

    return { success: true, message: 'برداشت با موفقیت ثبت شد. منتظر تایید مدیریت باشید.', balance: user.balance, payment_id: payment.id };
  } catch (error) {
    console.error('Error withdrawing from wallet:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در برداشت از کیف‌پول.',
    });
  }
});
