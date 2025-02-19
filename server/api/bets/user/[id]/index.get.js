// server/api/bets/user/[id]/index.get.js
import { Bet } from '../../../../models/database';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;

  try {
    const userBets = await Bet.findAll({
      where: { user_id: userId,
        status: 'active',
       },
      attributes: ['id', 'event_id', 'bet_option', 'bet_amount', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    return { success: true, bets: userBets };
  } catch (error) {
    console.error('Error fetching bets for user:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت شرط‌بندی‌های کاربر.',
    });
  }
});
