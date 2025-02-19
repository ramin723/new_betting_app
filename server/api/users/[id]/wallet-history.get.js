// server/api/users/[id]/wallet-history.get.js
import { WalletHistory } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;

  try {
    const history = await WalletHistory.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']],
    });

    return { success: true, walletHistory: history };
  } catch (error) {
    console.error('Error fetching wallet history:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت تاریخچه کیف‌پول.',
    });
  }
});
