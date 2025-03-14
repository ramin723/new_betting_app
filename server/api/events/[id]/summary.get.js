// server/api/events/[id]/summary.get.js
import { Event, Bet, Option, User, PendingCommission, sequelize } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const eventId = event.context.params.id;

  try {
    // دریافت رویداد با گزینه‌ها
    const eventData = await Event.findByPk(eventId, {
      include: [
        {
          model: Option,
          as: 'Options',
          include: [
            {
              model: Bet,
              where: { status: 'active' },
              required: false,
              attributes: [
                [sequelize.fn('COUNT', sequelize.col('Bets.id')), 'bet_count'],
                [sequelize.fn('SUM', sequelize.col('Bets.bet_amount')), 'total_amount'],
                [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Bets.user_id'))), 'unique_users']
              ]
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'role']
        }
      ]
    });

    if (!eventData) {
      throw createError({
        statusCode: 404,
        message: 'رویداد یافت نشد.',
      });
    }

    // دریافت آمار کمیسیون‌ها
    const commissionStats = await PendingCommission.findAll({
      where: { 
        event_id: eventId,
        status: 'pending'
      },
      attributes: [
        'commission_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: ['commission_type']
    });

    // محاسبه آمار کلی شرط‌ها
    const totalBets = eventData.Options.reduce((sum, option) => {
      const betStats = option.Bets?.[0] || {};
      return {
        count: sum.count + Number(betStats.getDataValue('bet_count') || 0),
        amount: sum.amount + Number(betStats.getDataValue('total_amount') || 0),
        users: sum.users + Number(betStats.getDataValue('unique_users') || 0)
      };
    }, { count: 0, amount: 0, users: 0 });

    // آماده‌سازی آمار گزینه‌ها
    const optionsStats = eventData.Options.map(option => {
      const betStats = option.Bets?.[0] || {};
      const betAmount = Number(betStats.getDataValue('total_amount') || 0);
      
      return {
        id: option.id,
        text: option.text,
        value: option.value,
        odds: option.odds,
        is_winner: option.is_winner,
        order: option.order,
        stats: {
          bet_count: Number(betStats.getDataValue('bet_count') || 0),
          total_amount: betAmount,
          unique_users: Number(betStats.getDataValue('unique_users') || 0),
          percentage: totalBets.amount > 0 ? (betAmount / totalBets.amount * 100).toFixed(2) : 0,
          potential_win_amount: betAmount * option.odds
        }
      };
    });

    // آماده‌سازی آمار کمیسیون‌ها
    const commissionSummary = commissionStats.reduce((acc, stat) => {
      acc[stat.commission_type] = {
        count: Number(stat.getDataValue('count') || 0),
        total: Number(stat.getDataValue('total') || 0)
      };
      return acc;
    }, {});

    // محاسبه زمان‌های باقی‌مانده
    const now = new Date();
    const timeStatus = {
      is_started: eventData.start_time ? eventData.start_time <= now : true,
      is_ended: eventData.end_time ? eventData.end_time <= now : false,
      is_betting_open: eventData.betting_deadline > now,
      is_result_time: eventData.result_time <= now,
      betting_time_left: Math.max(0, eventData.betting_deadline - now),
      result_time_left: Math.max(0, eventData.result_time - now)
    };

    return { 
      success: true,
      event: {
        id: eventData.id,
        title: eventData.title,
        status: eventData.status,
        event_type: eventData.event_type,
        question: eventData.question,
        betting_deadline: eventData.betting_deadline,
        result_time: eventData.result_time,
        creator: eventData.creator,
        commission_rates: {
          creator: eventData.commission_creator,
          referral: eventData.commission_referral
        }
      },
      betting: {
        total_bets: totalBets.count,
        total_amount: totalBets.amount,
        unique_bettors: totalBets.users,
        average_bet: totalBets.count > 0 ? (totalBets.amount / totalBets.count).toFixed(2) : 0
      },
      options: optionsStats,
      commissions: commissionSummary,
      time_status: timeStatus
    };

  } catch (error) {
    console.error('Error fetching event summary:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'خطا در دریافت خلاصه رویداد.',
    });
  }
});
