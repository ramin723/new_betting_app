import { defineEventHandler, createError } from 'h3';
import { getServerSession } from '#auth';
import { Bet } from '../../models/Bet';
import { Event } from '../../models/Event';
import { User } from '../../models/User';
import { WalletHistory } from '../../models/WalletHistory';
import { Op } from 'sequelize';
import { BET_STATUS, WALLET_HISTORY_TYPE } from '../../constants/constants';

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
      message: 'شما دسترسی لازم برای مشاهده گزارش‌ها را ندارید.'
    });
  }

  try {
    const query = getQuery(event);
    const { start_date, end_date } = query;

    const whereClause: any = {};
    if (start_date && end_date) {
      whereClause.createdAt = {
        [Op.between]: [new Date(start_date as string), new Date(end_date as string)]
      };
    }

    const totalUsers = await User.count();
    const totalEvents = await Event.count();
    const totalBets = await Bet.sum('bet_amount', {
      where: {
        status: BET_STATUS.WIN
      }
    });
    const totalTransactions = await WalletHistory.count();

    // آمار روزانه
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyStats = await Promise.all([
      Bet.count({
        where: {
          createdAt: {
            [Op.gte]: today
          }
        }
      }),
      WalletHistory.count({
        where: {
          createdAt: {
            [Op.gte]: today
          }
        }
      })
    ]);

    // آمار ماهانه
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyStats = await Promise.all([
      Bet.sum('bet_amount', {
        where: {
          createdAt: {
            [Op.gte]: firstDayOfMonth
          }
        }
      }),
      WalletHistory.count({
        where: {
          createdAt: {
            [Op.gte]: firstDayOfMonth
          }
        }
      })
    ]);

    return {
      total: {
        users: totalUsers,
        events: totalEvents,
        bets: totalBets,
        transactions: totalTransactions
      },
      daily: {
        bets: dailyStats[0],
        transactions: dailyStats[1]
      },
      monthly: {
        betAmount: monthlyStats[0],
        transactions: monthlyStats[1]
      }
    };
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw createError({
      statusCode: 500,
      message: 'Error fetching reports'
    });
  }
}); 