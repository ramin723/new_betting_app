// server/api/events/[id]/index.delete.js
import { Event, Bet, User, Option, EventTag, PendingCommission, sequelize } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const eventId = event.context.params.id;
  const query = getQuery(event);
  const { admin_id } = query;

  try {
    // بررسی دسترسی ادمین
    const admin = await User.findByPk(admin_id);
    if (!admin || admin.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'شما اجازه‌ی حذف این رویداد را ندارید.',
      });
    }

    // پیدا کردن رویداد با تمام اطلاعات مرتبط
    const existingEvent = await Event.findByPk(eventId, {
      include: [
        {
          model: Option,
          as: 'Options',
          include: [
            {
              model: Bet,
              attributes: [[sequelize.fn('COUNT', sequelize.col('Options.Bets.id')), 'bet_count']]
            }
          ]
        }
      ]
    });

    if (!existingEvent) {
      throw createError({
        statusCode: 404,
        message: 'رویداد یافت نشد.',
      });
    }

    // بررسی وجود شرط‌بندی
    const hasBets = existingEvent.Options.some(option => 
      option.Bets?.[0]?.getDataValue('bet_count') > 0
    );

    // شروع تراکنش
    const transaction = await sequelize.transaction();

    try {
      if (existingEvent.status === 'active' && hasBets) {
        // اگر رویداد فعال است و روی آن شرط‌بندی شده، فقط وضعیت آن را به 'cancelled' تغییر می‌دهیم
        await existingEvent.update(
          { 
            status: 'cancelled',
            end_time: new Date(),
            admin_note: 'رویداد توسط ادمین لغو شد.'
          },
          { transaction }
        );

        // برگرداندن مبلغ شرط‌بندی‌ها به کاربران
        const bets = await Bet.findAll({
          where: { 
            event_id: eventId,
            status: 'active'
          },
          include: [
            {
              model: User,
              attributes: ['id', 'balance']
            }
          ],
          transaction
        });

        // به‌روزرسانی وضعیت شرط‌ها و برگرداندن پول
        await Promise.all(bets.map(async (bet) => {
          await bet.update({ status: 'refunded' }, { transaction });
          await bet.User.increment('balance', { 
            by: bet.bet_amount,
            transaction
          });
        }));

        // حذف کمیسیون‌های در انتظار
        await PendingCommission.destroy({
          where: { event_id: eventId },
          transaction
        });

        await transaction.commit();

        return { 
          success: true, 
          message: 'رویداد دارای شرط‌بندی فعال بود، بنابراین لغو شد و مبالغ به کاربران برگردانده شد.'
        };
      }

      // اگر رویداد شرط‌بندی نداشت یا فعال نبود، می‌توانیم آن را کاملاً حذف کنیم
      // حذف تمام داده‌های مرتبط
      await Promise.all([
        // حذف شرط‌بندی‌ها
        Bet.destroy({
          where: { event_id: eventId },
          transaction
        }),
        // حذف کمیسیون‌های در انتظار
        PendingCommission.destroy({
          where: { event_id: eventId },
          transaction
        }),
        // حذف تگ‌های رویداد
        EventTag.destroy({
          where: { event_id: eventId },
          transaction
        }),
        // حذف گزینه‌ها
        Option.destroy({
          where: { event_id: eventId },
          transaction
        })
      ]);

      // حذف خود رویداد
      await existingEvent.destroy({ transaction });

      await transaction.commit();

      return { 
        success: true, 
        message: 'رویداد و تمام داده‌های مرتبط با آن با موفقیت حذف شدند.'
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error deleting event:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'خطا در حذف رویداد.',
    });
  }
});
