import { defineEventHandler, createError, getCookie } from 'h3'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { Event } from '../models/Event'
import { Bet } from '../models/Bet'
import { WalletHistory } from '../models/WalletHistory'
import { useRuntimeConfig } from '#imports'
import type { UserModel } from '../models/types/UserInterface'
import type { EventModel } from '../models/types/EventInterface'
import type { BetModel } from '../models/types/BetInterface'
import type { WalletHistoryModel } from '../models/types/WalletHistoryInterface'
import { BET_STATUS } from '../constants/constants'

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
    const decoded = jwt.verify(token, config.auth?.secret) as { userId: number }
    if (!decoded?.userId) {
      throw createError({
        statusCode: 401,
        message: 'توکن نامعتبر است'
      })
    }

    // دریافت اطلاعات کاربر
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'کاربر یافت نشد'
      })
    }

    // دریافت رویدادهای کاربر
    const events = await Event.findAll({
      where: { creator_id: user.id },
      order: [['createdAt', 'DESC']],
      limit: 10
    })

    // دریافت شرط‌های کاربر
    const bets = await Bet.findAll({
      where: { user_id: user.id },
      order: [['createdAt', 'DESC']],
      limit: 10
    })

    // دریافت تراکنش‌های کیف پول
    const transactions = await WalletHistory.findAll({
      where: { user_id: user.id },
      order: [['createdAt', 'DESC']],
      limit: 10
    })

    // محاسبه آمار
    const stats = {
      total_events: events.length,
      total_bets: bets.length,
      total_transactions: transactions.length,
      total_won: bets.filter(bet => bet.status === 'WIN').length,
      total_lost: bets.filter(bet => bet.status === 'LOSS').length,
      win_rate: bets.length > 0 
        ? (bets.filter(bet => bet.status === 'WIN').length / bets.length * 100).toFixed(2)
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