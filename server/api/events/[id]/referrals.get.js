// server/api/events/[id]/referrals.get.js
import { Event, EventReferral, User, Bet, PendingCommission, sequelize } from '../../../models/database';
import { defineEventHandler, createError, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  const eventId = event.context.params.id;
  const query = getQuery(event);
  const { admin_id } = query;

  try {
    // بررسی دسترسی ادمین
    if (admin_id) {
      const admin = await User.findByPk(admin_id);
      if (!admin || admin.role !== 'admin') {
        throw createError({
          statusCode: 403,
          message: 'شما اجازه‌ی دسترسی به این اطلاعات را ندارید.',
        });
      }
    }

    // بررسی وجود رویداد
    const existingEvent = await Event.findByPk(eventId);
    if (!existingEvent) {
      throw createError({
        statusCode: 404,
        message: 'رویداد یافت نشد.',
      });
    }

    // دریافت لیست ارجاع‌ها با اطلاعات کامل
    const referrals = await EventReferral.findAll({
      where: { event_id: eventId },
      attributes: [
        'id',
        'referrer_id',
        'referral_code',
        'created_at',
        [sequelize.fn('COUNT', sequelize.col('Bets.id')), 'total_bets'],
        [sequelize.fn('SUM', sequelize.col('Bets.bet_amount')), 'total_bet_amount'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Bets.user_id'))), 'unique_bettors']
      ],
      include: [
        {
          model: User,
          as: 'referrer',
          attributes: ['id', 'username', 'role'],
        },
        {
          model: Bet,
          attributes: [],
          required: false,
          where: { status: 'active' }
        },
        {
          model: PendingCommission,
          attributes: [
            [sequelize.fn('SUM', sequelize.col('amount')), 'total_commission'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'commission_count']
          ],
          required: false,
          where: { status: 'pending' }
        }
      ],
      group: ['EventReferral.id', 'referrer.id'],
      order: [[sequelize.col('total_bet_amount'), 'DESC']]
    });

    // محاسبه آمار کلی
    const stats = {
      total_referrers: referrals.length,
      total_bets: referrals.reduce((sum, ref) => sum + Number(ref.getDataValue('total_bets') || 0), 0),
      total_bet_amount: referrals.reduce((sum, ref) => sum + Number(ref.getDataValue('total_bet_amount') || 0), 0),
      total_unique_bettors: referrals.reduce((sum, ref) => sum + Number(ref.getDataValue('unique_bettors') || 0), 0),
      total_pending_commission: referrals.reduce((sum, ref) => {
        const commission = ref.PendingCommissions?.[0];
        return sum + Number(commission?.getDataValue('total_commission') || 0);
      }, 0)
    };

    // اضافه کردن درصد و رتبه به هر ارجاع
    const enrichedReferrals = referrals.map((referral, index) => {
      const betAmount = Number(referral.getDataValue('total_bet_amount') || 0);
      const commission = referral.PendingCommissions?.[0];
      const totalCommission = Number(commission?.getDataValue('total_commission') || 0);

      return {
        ...referral.toJSON(),
        rank: index + 1,
        percentage: stats.total_bet_amount > 0 
          ? ((betAmount / stats.total_bet_amount) * 100).toFixed(2) 
          : 0,
        commission_stats: {
          total: totalCommission,
          count: Number(commission?.getDataValue('commission_count') || 0)
        }
      };
    });

    return { 
      success: true, 
      referrals: enrichedReferrals,
      stats,
      event: {
        id: existingEvent.id,
        title: existingEvent.title,
        status: existingEvent.status,
        commission_referral: existingEvent.commission_referral
      }
    };

  } catch (error) {
    console.error('Error fetching event referrals:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'خطا در دریافت اطلاعات ارجاع‌های این رویداد.',
    });
  }
});
