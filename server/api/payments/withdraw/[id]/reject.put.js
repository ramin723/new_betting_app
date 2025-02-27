import { Payment, User, WalletHistory } from '../../../../models/database';

export default defineEventHandler(async (event) => {
  const paymentId = event.context.params.id;

  try {
    // دریافت اطلاعات درخواست برداشت
    const payment = await Payment.findByPk(paymentId);
    if (!payment || payment.status !== 'pending') {
      throw createError({ statusCode: 400, message: 'پرداخت یافت نشد یا قبلاً پردازش شده است.' });
    }

    // دریافت اطلاعات کاربر
    const user = await User.findByPk(payment.user_id);
    if (!user) {
      throw createError({ statusCode: 404, message: 'کاربر مربوط به این درخواست یافت نشد.' });
    }

    // بازگرداندن مبلغ به کاربر (در صورتی که از موجودی کم شده باشد)
    user.balance += payment.amount;
    await user.save();

    // تغییر وضعیت درخواست برداشت به رد شده
    payment.status = 'rejected';
    await payment.save();

    // ثبت این اقدام در WalletHistory
    await WalletHistory.create({
      user_id: user.id,
      wallet_address: user.wallet_address || 'N/A',
      status: 'withdraw_rejected',
    });

    return { success: true, message: `برداشت ${payment.amount} رد شد و مبلغ به حساب کاربر بازگردانده شد.` };
  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در رد برداشت.',
    });
  }
});
