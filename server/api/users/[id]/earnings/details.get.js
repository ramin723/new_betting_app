import { User, Event, EventReferral, PendingCommission, Bet, sequelize } from '../../../../models/database';
import { defineEventHandler, createError, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;
  const query = getQuery(event);
  const { type = 'events', page = 1, limit = 10 } = query;
  const offset = (page - 1) * limit;

  try {
    // بررسی وجود کاربر
    const user = await User.findByPk(userId);
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'کاربر یافت نشد.',
      });
    }

    let data = {};
    let total = 0;

    if (type === 'events') {
      // دریافت لیست رویدادها با جزئیات درآمد
      const events = await Event.findAndCountAll({
        where: { creator_id: userId },
        attributes: [
          'id',
          'title',
          'status',
          'created_at',
          'commission_creator',
          'participants_count',
          [sequelize.fn('SUM', sequelize.col('Bets.bet_amount')), 'total_pool'],
          [sequelize.literal('commission_creator * SUM(Bets.bet_amount)'), 'commission_amount']
        ],
        include: [{
          model: Bet,
          attributes: [],
          required: false
        }],
        group: ['Event.id'],
        order: [['created_at', 'DESC']],
        limit,
        offset,
        subQuery: false
      });

      data = events.rows;
      total = events.count.length;

    } else if (type === 'referrals') {
      // دریافت لیست دعوت‌ها با جزئیات درآمد
      const referrals = await EventReferral.findAndCountAll({
        where: { referrer_id: userId },
        attributes: [
          'id',
          'event_id',
          'referral_code',
          'created_at',
          [sequelize.fn('COUNT', sequelize.col('Bets.id')), 'total_bets'],
          [sequelize.fn('SUM', sequelize.col('Bets.bet_amount')), 'total_bet_amount']
        ],
        include: [
          {
            model: Event,
            attributes: ['title', 'status', 'commission_referral']
          },
          {
            model: Bet,
            attributes: [],
            required: false
          },
          {
            model: PendingCommission,
            attributes: [
              'amount',
              'status',
              'created_at'
            ],
            required: false
          }
        ],
        group: ['EventReferral.id', 'Event.id', 'PendingCommissions.id'],
        order: [['created_at', 'DESC']],
        limit,
        offset,
        subQuery: false
      });

      data = referrals.rows;
      total = referrals.count.length;
    }

    return {
      success: true,
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        total_pages: Math.ceil(total / limit)
      }
    };

  } catch (error) {
    console.error('Error fetching user earnings details:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'خطا در دریافت جزئیات درآمد کاربر.',
    });
  }
}); 