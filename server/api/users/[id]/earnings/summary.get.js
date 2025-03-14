import { User, Event, EventReferral, PendingCommission, sequelize } from '../../../../models/database';
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;

  try {
    // بررسی وجود کاربر
    const user = await User.findByPk(userId);
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'کاربر یافت نشد.',
      });
    }

    // دریافت آمار درآمد از رویدادها
    const eventEarnings = await Event.findOne({
      where: { creator_id: userId },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('commission_creator')), 'total_commission'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_events'],
        [sequelize.fn('SUM', sequelize.col('participants_count')), 'total_participants']
      ],
      raw: true
    });

    // دریافت آمار درآمد از دعوت‌ها
    const referralEarnings = await EventReferral.findOne({
      where: { referrer_id: userId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_referrals'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Bets.user_id'))), 'total_referred_users']
      ],
      include: [{
        model: PendingCommission,
        attributes: [
          [sequelize.fn('SUM', sequelize.col('amount')), 'total_commission'],
          [sequelize.fn('SUM', sequelize.literal('CASE WHEN status = "pending" THEN amount ELSE 0 END')), 'pending_commission']
        ],
        required: false
      }],
      raw: true
    });

    return {
      success: true,
      data: {
        events: {
          total_commission: Number(eventEarnings?.total_commission || 0),
          total_events: Number(eventEarnings?.total_events || 0),
          total_participants: Number(eventEarnings?.total_participants || 0),
          pending_commission: 0 // محاسبه در مرحله بعد
        },
        referrals: {
          total_commission: Number(referralEarnings?.['PendingCommissions.total_commission'] || 0),
          pending_commission: Number(referralEarnings?.['PendingCommissions.pending_commission'] || 0),
          total_referrals: Number(referralEarnings?.total_referrals || 0),
          total_referred_users: Number(referralEarnings?.total_referred_users || 0)
        }
      }
    };

  } catch (error) {
    console.error('Error fetching user earnings summary:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'خطا در دریافت اطلاعات درآمد کاربر.',
    });
  }
}); 