import { Event, User, Option, Tag, sequelize } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const eventId = event.context.params.id;
  const body = await readBody(event);
  const { admin_id, admin_note } = body;

  try {
    // بررسی دسترسی ادمین
    const admin = await User.findByPk(admin_id);
    if (!admin || admin.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'شما اجازه‌ی تایید این رویداد را ندارید.',
      });
    }

    // شروع تراکنش
    const transaction = await sequelize.transaction();

    try {
      // پیدا کردن رویداد با تمام اطلاعات مرتبط
      const existingEvent = await Event.findByPk(eventId, {
        include: [
          {
            model: Option,
            as: 'Options'
          }
        ],
        transaction
      });

      if (!existingEvent || existingEvent.status !== 'pending') {
        throw createError({
          statusCode: 404,
          message: 'رویداد یافت نشد یا قبلاً تایید شده است.',
        });
      }

      // بررسی وجود حداقل دو گزینه
      if (!existingEvent.Options || existingEvent.Options.length < 2) {
        throw createError({
          statusCode: 400,
          message: 'رویداد باید حداقل دو گزینه داشته باشد.',
        });
      }

      // بررسی تنظیم بودن فیلدهای ضروری
      if (!existingEvent.betting_deadline || !existingEvent.result_time) {
        throw createError({
          statusCode: 400,
          message: 'مهلت شرط‌بندی و زمان اعلام نتیجه باید مشخص شده باشند.',
        });
      }

      // تنظیم زمان‌های رویداد
      const now = new Date();
      const updateData = {
        status: 'active',
        start_time: existingEvent.start_time || now,
        admin_note: admin_note || 'رویداد توسط ادمین تایید شد.',
      };

      // به‌روزرسانی رویداد
      await existingEvent.update(updateData, { transaction });

      // دریافت رویداد به‌روز شده با تمام اطلاعات
      const updatedEvent = await Event.findByPk(eventId, {
        include: [
          {
            model: Tag,
            through: { attributes: [] },
          },
          {
            model: Option,
            as: 'Options',
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'role'],
          }
        ],
        transaction
      });

      // تایید تراکنش
      await transaction.commit();

      return { 
        success: true, 
        message: 'رویداد با موفقیت تایید شد.',
        event: updatedEvent
      };

    } catch (error) {
      // برگرداندن تراکنش در صورت خطا
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error approving event:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'خطا در تایید رویداد.',
    });
  }
});
