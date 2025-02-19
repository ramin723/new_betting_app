// server/api/payments/withdraw/[id]/reject.put.js
import { Payment } from '../../../../models/database';

export default defineEventHandler(async (event) => {
  const paymentId = event.context.params.id;

  try {
    const payment = await Payment.findByPk(paymentId);

    if (!payment || payment.status !== 'pending') {
      throw createError({
        statusCode: 400,
        message: 'پرداخت یافت نشد یا قبلاً رد شده است.',
      });
    }

    payment.status = 'rejected';
    await payment.save();

    return { success: true, message: 'برداشت رد شد.' };
  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در رد برداشت.',
    });
  }
});
