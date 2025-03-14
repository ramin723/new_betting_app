import { Event, Bet, PendingCommission, User, Option, sequelize } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const eventId = event.context.params.id;
  const body = await readBody(event);
  const { winner_option_id, admin_id, admin_note } = body;

  try {
    // بررسی دسترسی ادمین
    const admin = await User.findByPk(admin_id);
    if (!admin || admin.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'شما اجازه‌ی بستن این رویداد را ندارید.',
      });
    }

    // شروع تراکنش
    const transaction = await sequelize.transaction();

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
                required: false
              }
            ]
          }
        ],
        transaction
      });

      if (!eventData) {
        throw createError({ 
          statusCode: 404, 
          message: 'رویداد یافت نشد.' 
        });
      }

      if (eventData.status === 'closed' || eventData.status === 'cancelled') {
        throw createError({ 
          statusCode: 400, 
          message: 'این رویداد قبلاً بسته یا لغو شده است.' 
        });
      }

      // محاسبه مجموع شرط‌ها
      const totalPool = eventData.Options.reduce((sum, option) => 
        sum + option.Bets.reduce((betSum, bet) => betSum + bet.bet_amount, 0), 0
      );

      if (totalPool <= 0) {
        throw createError({ 
          statusCode: 400, 
          message: 'رویداد هیچ شرط‌بندی فعالی ندارد.' 
        });
      }

      // بررسی گزینه برنده
      let winningOption = null;
      if (winner_option_id) {
        winningOption = eventData.Options.find(opt => opt.id === winner_option_id);
        if (!winningOption) {
          throw createError({ 
            statusCode: 400, 
            message: 'گزینه برنده نامعتبر است.' 
          });
        }
      }

      // محاسبه کمیسیون‌ها
      const commissionTotal = totalPool * 0.15; // 15% کل کمیسیون
      const creatorCommission = totalPool * eventData.commission_creator; // کمیسیون سازنده
      const referralCommission = totalPool * eventData.commission_referral; // کمیسیون دعوت‌کنندگان
      const siteCommission = commissionTotal - creatorCommission - referralCommission;

      // پرداخت کمیسیون به سازنده
      if (eventData.creator_id) {
        await User.increment('balance', { 
          by: creatorCommission,
          where: { id: eventData.creator_id },
          transaction
        });
      }

      // پرداخت کمیسیون‌های دعوت
      const pendingCommissions = await PendingCommission.findAll({ 
        where: { 
          event_id: eventId, 
          status: 'pending' 
        },
        transaction
      });

      await Promise.all(pendingCommissions.map(async (commission) => {
        await User.increment('balance', {
          by: commission.amount,
          where: { id: commission.user_id },
          transaction
        });

        await commission.update({ status: 'paid' }, { transaction });
      }));

      // پردازش نتیجه و پرداخت جوایز
      if (winningOption) {
        // به‌روزرسانی گزینه برنده
        await Option.update(
          { is_winner: false },
          { 
            where: { event_id: eventId },
            transaction
          }
        );

        await Option.update(
          { is_winner: true },
          { 
            where: { id: winner_option_id },
            transaction
          }
        );

        // محاسبه و پرداخت جوایز
        const winningBets = winningOption.Bets;
        const totalWinningBets = winningBets.reduce((sum, bet) => sum + bet.bet_amount, 0);
        const prizePool = totalPool - commissionTotal;

        if (winningBets.length > 0) {
          await Promise.all(winningBets.map(async (bet) => {
            const winAmount = (bet.bet_amount / totalWinningBets) * prizePool;
            await User.increment('balance', {
              by: winAmount,
              where: { id: bet.user_id },
              transaction
            });

            await bet.update({ 
              status: 'won',
              win_amount: winAmount
            }, { transaction });
          }));
        }

        // به‌روزرسانی وضعیت شرط‌های بازنده
        await Bet.update(
          { status: 'lost' },
          {
            where: { 
              event_id: eventId,
              status: 'active',
              id: { [sequelize.Op.notIn]: winningBets.map(b => b.id) }
            },
            transaction
          }
        );

      } else {
        // بازگشت پول در صورت عدم تعیین برنده
        const refundRatio = 1 - (siteCommission / totalPool); // فقط کمیسیون سایت کم می‌شود

        await Promise.all(eventData.Options.map(async (option) => {
          await Promise.all(option.Bets.map(async (bet) => {
            const refundAmount = bet.bet_amount * refundRatio;
            await User.increment('balance', {
              by: refundAmount,
              where: { id: bet.user_id },
              transaction
            });

            await bet.update({ 
              status: 'refunded',
              win_amount: refundAmount
            }, { transaction });
          }));
        }));
      }

      // به‌روزرسانی رویداد
      await eventData.update({
        status: 'closed',
        end_time: new Date(),
        admin_note: admin_note || 'رویداد توسط ادمین بسته شد.'
      }, { transaction });

      // تایید تراکنش
      await transaction.commit();

      // دریافت رویداد به‌روز شده
      const updatedEvent = await Event.findByPk(eventId, {
        include: [
          {
            model: Option,
            as: 'Options',
            include: [
              {
                model: Bet,
                attributes: ['id', 'user_id', 'bet_amount', 'status', 'win_amount']
              }
            ]
          }
        ]
      });

      return { 
        success: true, 
        message: 'رویداد با موفقیت بسته شد و جوایز توزیع شدند.',
        event: updatedEvent,
        summary: {
          total_pool: totalPool,
          commission: {
            total: commissionTotal,
            creator: creatorCommission,
            referral: referralCommission,
            site: siteCommission
          }
        }
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error closing event:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'خطا در بستن رویداد.',
    });
  }
});
