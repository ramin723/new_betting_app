import { defineEventHandler, createError, getCookie } from 'h3'
import jwt from 'jsonwebtoken'
import { User, Event, Bet, WalletHistory } from '~/server/models/database'
import { useRuntimeConfig } from '#imports'
import type { UserModel, EventModel, BetModel, WalletHistoryModel } from '~/types/models'
import { AUTH_CONSTANTS } from '../constants/auth'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // دریافت توکن از کوکی
    const token = getCookie(event, config.auth?.cookieName || 'auth_token')
    if (!token) {
      throw createError({
        statusCode: 401,
        message: 'لطفا وارد حساب کاربری خود شوید'
      })
    }

    // بررسی اعتبار توکن
    const decoded = jwt.verify(token, config.auth?.secret || AUTH_CONSTANTS.DEFAULT_JWT_SECRET) as { userId: number }
    if (!decoded?.userId) {
      throw createError({
        statusCode: 401,
        message: 'توکن نامعتبر است'
      })
    }

    // دریافت اطلاعات کاربر
    const user = await User.findByPk(decoded.userId, {
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
      where: { creator_id: user.id },
      order: [['created_at', 'DESC']],
      limit: 10
    }) as EventModel[]

    // دریافت شرط‌های کاربر
    const bets = await Bet.findAll({
      where: { user_id: user.id },
      order: [['created_at', 'DESC']],
      limit: 10
    }) as BetModel[]

    // دریافت تراکنش‌های کیف پول
    const transactions = await WalletHistory.findAll({
      where: { user_id: user.id },
      order: [['created_at', 'DESC']],
      limit: 10
    }) as WalletHistoryModel[]

    // محاسبه آمار
    const stats = {
      total_events: events.length,
      total_bets: bets.length,
      total_transactions: transactions.length,
      total_won: bets.filter(bet => bet.status === 'won').length,
      total_lost: bets.filter(bet => bet.status === 'lost').length,
      win_rate: bets.length > 0 
        ? (bets.filter(bet => bet.status === 'won').length / bets.length * 100).toFixed(2)
        : 0
    }

    return {
      success: true,
      data: {
        user,
        events,
        bets,
        transactions,
        stats
      }
    }
  } catch (err: any) {
    console.error('Error in profile endpoint:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'خطای سرور'
    })
  }
}) 