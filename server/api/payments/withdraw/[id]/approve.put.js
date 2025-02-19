// server/api/payments/withdraw/[id]/approve.put.js
import { Payment } from '../../../../models/database';

export default defineEventHandler(async (event) => {
  const paymentId = event.context.params.id;

  try {
    const payment = await Payment.findByPk(paymentId);

    if (!payment || payment.status !== 'pending') {
      throw createError({
        statusCode: 400,
        message: 'پرداخت یافت نشد یا قبلاً تایید شده است.',
      });
    }

    payment.status = 'approved';
    await payment.save();

    return { success: true, message: 'برداشت تایید شد.' };
  } catch (error) {
    console.error('Error approving withdrawal:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در تایید برداشت.',
    });
  }
});
