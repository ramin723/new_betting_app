// server/api/payments/user/[id]/index.get.js
import { Payment } from '../../../../models/database';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;

  try {
    const userPayments = await Payment.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']],
    });

    return { success: true, payments: userPayments };
  } catch (error) {
    console.error('Error fetching user payments:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت پرداخت‌های کاربر.',
    });
  }
});
