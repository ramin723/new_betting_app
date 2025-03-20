import { defineEventHandler, createError } from 'h3';
import { getServerSession } from '#auth';
import { Bet } from '../../models/Bet';
import { Event } from '../../models/Event';
import { User } from '../../models/User';
import { WalletHistory } from '../../models/WalletHistory';
import { Op } from 'sequelize';
import { sequelize } from '../../config/database';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.'
    });
  }

  // بررسی دسترسی ادمین
  if (session.user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'شما دسترسی لازم برای مشاهده تحلیل‌ها را ندارید.'
    });
  }

  try {
    const query = getQuery(event);
    const { period = '7d' } = query;

    // محاسبه تاریخ شروع بر اساس دوره
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // تحلیل کاربران
    const newUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      }
    });

    const activeUsers = await Bet.findAll({
      attributes: ['user_id'],
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      group: ['user_id']
    });

    // تحلیل رویدادها
    const newEvents = await Event.count({
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      }
    });

    const popularEvents = await Event.findAll({
      attributes: ['id', 'title', [sequelize.fn('COUNT', sequelize.col('Bets.id')), 'bet_count']],
      include: [{
        model: Bet,
        attributes: []
      }],
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      group: ['Event.id', 'Event.title'],
      order: [[sequelize.fn('COUNT', sequelize.col('Bets.id')), 'DESC']],
      limit: 5
    });

    // تحلیل مالی
    const dailyStats = await WalletHistory.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN type = \'DEPOSIT\' THEN amount ELSE 0 END')), 'deposits'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN type = \'WITHDRAW\' THEN amount ELSE 0 END')), 'withdrawals']
      ],
      where: {
        createdAt: {
          [Op.gte]: startDate
        },
        status: 'COMPLETED'
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    // تحلیل شرط‌ها
    const betStats = await Bet.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
      ],
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    return {
      success: true,
      data: {
        users: {
          new: newUsers,
          active: activeUsers.length
        },
        events: {
          new: newEvents,
          popular: popularEvents
        },
        financial: {
          daily: dailyStats
        },
        bets: {
          daily: betStats
        }
      }
    };
  } catch (error) {
    console.error('Error generating analytics:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در تولید تحلیل‌ها.'
    });
  }
}); 