// server/api/events/[id]/summary.get.js
import { Bet } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const eventId = event.context.params.id;

  try {
    const bets = await Bet.findAll({ where: { event_id: eventId, status: 'active' } });

    const summary = bets.reduce((acc, bet) => {
      acc[bet.bet_option] = (acc[bet.bet_option] || 0) + bet.bet_amount;
      return acc;
    }, {});

    return { success: true, summary };
  } catch (error) {
    console.error('Error fetching bet summary:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت خلاصه شرط‌بندی‌ها.',
    });
  }
});
