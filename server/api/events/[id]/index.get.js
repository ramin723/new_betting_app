// server/api/events/[id]/index.get.js
import { Event, Tag, Option, User, EventTemplate, Bet, PendingCommission, sequelize, EventTag } from '../../../models/database';
import { Op } from 'sequelize';
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const id = event.context.params.id;

  try {
    // دریافت رویداد با تمام اطلاعات مرتبط
    const eventData = await Event.findOne({
      where: { id },
      include: [
        {
          model: Option,
          as: 'Options',
          attributes: [
            'id', 
            'text', 
            'value',
            'odds', 
            'total_bets', 
            'total_amount',
            'is_winner',
            'order'
          ]
        },
        {
          model: Tag,
          through: EventTag,
          attributes: ['id', 'name']
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
        message: 'رویداد مورد نظر یافت نشد.'
      });
    }

    // دریافت آمار شرط‌ها برای هر گزینه
    const betsStats = await Bet.findAll({
      attributes: [
        'option_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'bet_count'],
        [sequelize.fn('SUM', sequelize.col('bet_amount')), 'total_amount'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('user_id'))), 'unique_users']
      ],
      where: {
        event_id: id,
        status: 'active'
      },
      group: ['option_id']
    });

    // تبدیل آمار به یک آبجکت برای دسترسی راحت‌تر
    const statsMap = betsStats.reduce((acc, stat) => {
      acc[stat.option_id] = {
        bet_count: parseInt(stat.getDataValue('bet_count') || 0),
        total_amount: parseFloat(stat.getDataValue('total_amount') || 0),
        unique_users: parseInt(stat.getDataValue('unique_users') || 0)
      };
      return acc;
    }, {});

    // محاسبه مجموع کل شرط‌ها
    const totalBetAmount = Object.values(statsMap).reduce((sum, stat) => sum + stat.total_amount, 0);

    // اضافه کردن آمار به گزینه‌ها
    const optionsWithStats = eventData.Options.map(option => {
      const stats = statsMap[option.id] || {
        bet_count: 0,
        total_amount: 0,
        unique_users: 0
      };

      const optionData = option.toJSON();
      
      return {
        ...optionData,
        betting_stats: {
          ...stats,
          percentage: totalBetAmount > 0 ? ((stats.total_amount / totalBetAmount) * 100).toFixed(2) : 0,
          potential_win_amount: stats.total_amount * option.odds
        }
      };
    });

    // محاسبه وضعیت زمانی
    const now = new Date();
    const timeStatus = {
      is_started: eventData.start_time ? new Date(eventData.start_time) <= now : true,
      is_ended: eventData.end_time ? new Date(eventData.end_time) <= now : false,
      is_betting_open: new Date(eventData.betting_deadline) > now,
      is_result_time: new Date(eventData.result_time) <= now,
      betting_time_left: Math.max(0, new Date(eventData.betting_deadline) - now),
      result_time_left: Math.max(0, new Date(eventData.result_time) - now)
    };

    // تبدیل تاریخ‌ها به فرمت مناسب
    const eventJSON = eventData.toJSON();
    const dateFields = ['start_time', 'end_time', 'betting_deadline', 'result_time', 'created_at', 'updated_at'];
    dateFields.forEach(field => {
      if (eventJSON[field]) {
        eventJSON[field] = new Date(eventJSON[field]).toISOString();
      }
    });

    // ساختار نهایی پاسخ
    const response = {
      success: true,
      event: {
        ...eventJSON,
        Options: optionsWithStats,
        total_pool: totalBetAmount,
        time_status: timeStatus
      }
    };

    return response;

  } catch (error) {
    console.error('Error fetching event details:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'خطا در دریافت اطلاعات رویداد'
    });
  }
});
