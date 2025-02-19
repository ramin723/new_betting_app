// server/api/payments/index.post.js
import { Payment } from '../../models/database';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { user_id, amount, method } = body;

  if (!user_id || !amount || !method) {
    throw createError({
      statusCode: 400,
      message: 'تمام اطلاعات پرداخت الزامی است.',
    });
  }

  try {
    const payment = await Payment.create({
      user_id,
      amount,
      method,
      status: 'pending',
    });

    return { success: true, message: 'پرداخت با موفقیت ثبت شد.', payment };
  } catch (error) {
    console.error('Error creating payment:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در ثبت پرداخت.',
    });
  }
});
