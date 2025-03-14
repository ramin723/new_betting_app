import { defineEventHandler, createError } from 'h3'
import { User, Event, Bet, WalletHistory } from '~/server/models/database'
import type { UserModel, EventModel, BetModel, WalletHistoryModel } from '~/types/models'

export default defineEventHandler(async (event) => {
  try {
    const userId = Number(event.context.params?.id)
    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'شناسه کاربر نامعتبر است'
      })
    }

    // دریافت اطلاعات کاربر
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    }) as UserModel

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'کاربر یافت نشد'
      })
    }

    // دریافت رویدادهای کاربر
    const events = await Event.findAll({
      where: { creator_id: userId },
      order: [['created_at', 'DESC']],
      limit: 10
    }) as EventModel[]

    // دریافت شرط‌های کاربر
    const bets = await Bet.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 10
    }) as BetModel[]

    // دریافت تراکنش‌های کیف پول
    const transactions = await WalletHistory.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 10
    }) as WalletHistoryModel[]

    // محاسبه درآمد از رویدادها
    const eventEarnings = events.reduce((sum, event) => {
      return sum + (event.total_bets * event.commission_creator)
    }, 0)

    // محاسبه درآمد از شرط‌های برنده
    const betEarnings = bets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + bet.potential_win_amount, 0)

    // محاسبه آمار
    const stats = {
      total_events: events.length,
      total_bets: bets.length,
      total_transactions: transactions.length,
      total_won: bets.filter(bet => bet.status === 'won').length,
      total_lost: bets.filter(bet => bet.status === 'lost').length,
      win_rate: bets.length > 0 
        ? (bets.filter(bet => bet.status === 'won').length / bets.length * 100).toFixed(2)
        : 0,
      event_earnings: eventEarnings,
      bet_earnings: betEarnings,
      total_earnings: eventEarnings + betEarnings
    }

    return {
      success: true,
      data: {
        user,
        events,
        bets,
        wallet_history: transactions,
        stats
      }
    }
  } catch (err: any) {
    console.error('Error fetching user profile:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'خطای سرور'
    })
  }
}) 