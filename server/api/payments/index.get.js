// server/api/payments/index.get.js
import { Payment } from '../../models/database';

export default defineEventHandler(async () => {
  try {
    const payments = await Payment.findAll({
      order: [['createdAt', 'DESC']],
    });

    return { success: true, payments };
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت لیست پرداخت‌ها.',
    });
  }
});
