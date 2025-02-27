import { Payment, User, WalletHistory } from '../../../../models/database';

export default defineEventHandler(async (event) => {
  const paymentId = event.context.params.id;

  try {
    // دریافت اطلاعات درخواست برداشت
    const payment = await Payment.findByPk(paymentId);
    if (!payment || payment.status !== 'pending') {
      throw createError({ statusCode: 400, message: 'پرداخت یافت نشد یا قبلاً تایید شده است.' });
    }

    // دریافت اطلاعات کاربر مرتبط با این درخواست
    const user = await User.findByPk(payment.user_id);
    if (!user) {
      throw createError({ statusCode: 404, message: 'کاربر مربوط به این درخواست یافت نشد.' });
    }

    // بررسی اینکه کاربر هنوز موجودی کافی دارد
    if (user.balance < payment.amount) {
      throw createError({ statusCode: 400, message: 'موجودی کاربر برای برداشت کافی نیست.' });
    }

    // کاهش موجودی و ثبت تغییرات
    user.balance -= payment.amount;
    await user.save();

    // تغییر وضعیت درخواست برداشت به تایید شده
    payment.status = 'approved';
    await payment.save();

    // ثبت این برداشت در WalletHistory
    await WalletHistory.create({
      user_id: user.id,
      wallet_address: user.wallet_address || 'N/A',
      status: 'withdraw_approved',
    });

    return { success: true, message: `برداشت ${payment.amount} تایید شد و به کاربر ارسال گردید.` };
  } catch (error) {
    console.error('Error approving withdrawal:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در تایید برداشت.',
    });
  }
});
