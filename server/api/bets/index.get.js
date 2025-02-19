// server/api/bets/index.get.js
import { Bet } from '../../models/database';

export default defineEventHandler(async () => {
  try {
    const bets = await Bet.findAll({
      attributes: ['id', 'user_id', 'event_id', 'bet_option', 'bet_amount', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    return { success: true, bets };
  } catch (error) {
    console.error('Error fetching all bets:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت لیست شرط‌بندی‌ها.',
    });
  }
});
