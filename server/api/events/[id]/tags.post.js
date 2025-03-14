import { Event, Tag, EventTag, User, sequelize } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const eventId = event.context.params.id;
  const body = await readBody(event);
  const { tag_ids, admin_id, operation = 'add' } = body;

  try {
    // بررسی دسترسی ادمین
    const admin = await User.findByPk(admin_id);
    if (!admin || admin.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'شما اجازه‌ی مدیریت تگ‌های این رویداد را ندارید.',
      });
    }

    // بررسی وجود رویداد
    const existingEvent = await Event.findByPk(eventId, {
      include: [
        {
          model: Tag,
          through: { attributes: [] },
        }
      ]
    });

    if (!existingEvent) {
      throw createError({
        statusCode: 404,
        message: 'رویداد یافت نشد.',
      });
    }

    // بررسی آرایه تگ‌ها
    if (!Array.isArray(tag_ids)) {
      throw createError({
        statusCode: 400,
        message: 'لیست تگ‌ها باید به صورت آرایه باشد.',
      });
    }

    // شروع تراکنش
    const transaction = await sequelize.transaction();

    try {
      // بررسی وجود همه تگ‌ها
      const tags = await Tag.findAll({
        where: {
          id: tag_ids
        },
        transaction
      });

      if (tags.length !== tag_ids.length) {
        throw createError({
          statusCode: 400,
          message: 'برخی از تگ‌های درخواستی وجود ندارند.',
        });
      }

      if (operation === 'add') {
        // اضافه کردن تگ‌های جدید
        await Promise.all(tag_ids.map(async (tagId) => {
          await EventTag.findOrCreate({
            where: {
              event_id: eventId,
              tag_id: tagId
            },
            transaction
          });
        }));
      } else if (operation === 'remove') {
        // حذف تگ‌های مشخص شده
        await EventTag.destroy({
          where: {
            event_id: eventId,
            tag_id: tag_ids
          },
          transaction
        });
      } else if (operation === 'set') {
        // حذف همه تگ‌های قبلی و تنظیم تگ‌های جدید
        await EventTag.destroy({
          where: {
            event_id: eventId
          },
          transaction
        });

        await Promise.all(tag_ids.map(async (tagId) => {
          await EventTag.create({
            event_id: eventId,
            tag_id: tagId
          }, { transaction });
        }));
      } else {
        throw createError({
          statusCode: 400,
          message: 'عملیات نامعتبر. عملیات‌های مجاز: add, remove, set',
        });
      }

      // دریافت رویداد به‌روز شده با تگ‌ها
      const updatedEvent = await Event.findByPk(eventId, {
        include: [
          {
            model: Tag,
            through: { attributes: [] },
          }
        ],
        transaction
      });

      // تایید تراکنش
      await transaction.commit();

      const operationMessages = {
        add: 'تگ‌ها به رویداد اضافه شدند.',
        remove: 'تگ‌ها از رویداد حذف شدند.',
        set: 'تگ‌های رویداد به‌روزرسانی شدند.'
      };

      return { 
        success: true, 
        message: operationMessages[operation],
        event: updatedEvent
      };

    } catch (error) {
      // برگرداندن تراکنش در صورت خطا
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error managing event tags:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'خطا در مدیریت تگ‌های رویداد.',
    });
  }
});
