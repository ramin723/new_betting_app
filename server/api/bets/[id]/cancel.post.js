// server/api/bets/[id]/cancel.post.js
import { Bet, User } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const betId = event.context.params.id;

  try {
    const bet = await Bet.findByPk(betId);

    if (!bet || bet.status !== 'active') {
      throw createError({
        statusCode: 400,
        message: 'شرط‌بندی یافت نشد یا قابل لغو نیست.',
      });
    }

    const user = await User.findByPk(bet.user_id);
    if (user) {
      user.balance += bet.bet_amount;
      await user.save();
    }

    bet.status = 'cancelled';
    await bet.save();

    return { success: true, message: 'شرط‌بندی با موفقیت لغو شد.' };
  } catch (error) {
    console.error('Error cancelling bet:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در لغو شرط‌بندی.',
    });
  }
});
