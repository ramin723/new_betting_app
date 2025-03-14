// server/api/events/[id]/index.put.js
import { Event, Tag, EventTag, User, Option, sequelize } from '../../../models/database';
import { Op } from 'sequelize';

export default defineEventHandler(async (event) => {
  const eventId = event.context.params.id;
  const body = await readBody(event);
  const { 
    title, 
    description, 
    event_type,
    template_id,
    question,
    result_time,
    betting_deadline,
    start_time, 
    end_time,
    reference_event,
    reference_link,
    status,
    admin_note,
    is_featured,
    options,
    tags, 
    admin_id,
    winner_option_id
  } = body;

  try {
    // بررسی دسترسی ادمین
    const admin = await User.findByPk(admin_id);
    if (!admin || admin.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'شما اجازه‌ی ویرایش این رویداد را ندارید.',
      });
    }

    // پیدا کردن رویداد با گزینه‌ها
    const existingEvent = await Event.findByPk(eventId, {
      include: [
        {
          model: Option,
          as: 'Options'
        }
      ]
    });

    if (!existingEvent) {
      throw createError({
        statusCode: 404,
        message: 'رویداد موردنظر یافت نشد.',
      });
    }

    // شروع تراکنش
    const transaction = await sequelize.transaction();

    try {
      // به‌روزرسانی اطلاعات رویداد
      const updateData = {
        title: title || existingEvent.title,
        description: description || existingEvent.description,
        event_type: event_type || existingEvent.event_type,
        template_id: template_id || existingEvent.template_id,
        question: question || existingEvent.question,
        result_time: result_time || existingEvent.result_time,
        betting_deadline: betting_deadline || existingEvent.betting_deadline,
        start_time: start_time || existingEvent.start_time,
        end_time: end_time || existingEvent.end_time,
        reference_event: reference_event || existingEvent.reference_event,
        reference_link: reference_link || existingEvent.reference_link,
        admin_note: admin_note || existingEvent.admin_note,
        is_featured: is_featured !== undefined ? is_featured : existingEvent.is_featured
      };

      // به‌روزرسانی وضعیت
      if (status) {
        // بررسی تغییر وضعیت معتبر
        const validTransitions = {
          'draft': ['pending', 'cancelled'],
          'pending': ['active', 'cancelled'],
          'active': ['closed', 'cancelled'],
          'closed': [],
          'cancelled': []
        };

        if (!validTransitions[existingEvent.status].includes(status)) {
          throw createError({
            statusCode: 400,
            message: 'تغییر وضعیت درخواست شده معتبر نیست.',
          });
        }

        updateData.status = status;

        // تنظیم زمان‌های شروع و پایان در صورت فعال شدن رویداد
        if (status === 'active' && existingEvent.status !== 'active') {
          updateData.start_time = updateData.start_time || new Date();
        }
        
        // تنظیم زمان پایان در صورت بسته شدن رویداد
        if (status === 'closed' && existingEvent.status !== 'closed') {
          updateData.end_time = updateData.end_time || new Date();
        }
      }

      // به‌روزرسانی رویداد
      await existingEvent.update(updateData, { transaction });

      // به‌روزرسانی گزینه‌ها
      if (options && Array.isArray(options)) {
        // حذف گزینه‌های قبلی که در لیست جدید نیستند
        const newOptionIds = options.filter(opt => opt.id).map(opt => opt.id);
        if (newOptionIds.length > 0) {
          await Option.destroy({
            where: {
              event_id: eventId,
              id: { [Op.notIn]: newOptionIds }
            },
            transaction
          });
        }

        // به‌روزرسانی یا ایجاد گزینه‌های جدید
        await Promise.all(options.map(async (option, index) => {
          if (option.id) {
            await Option.update(
              {
                text: option.text,
                value: option.value,
                odds: option.odds,
                order: index
              },
              {
                where: { id: option.id },
                transaction
              }
            );
          } else {
            await Option.create(
              {
                ...option,
                event_id: eventId,
                order: index
              },
              { transaction }
            );
          }
        }));
      }

      // تعیین گزینه برنده
      if (winner_option_id && status === 'closed') {
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
            where: { 
              id: winner_option_id,
              event_id: eventId
            },
            transaction
          }
        );
      }

      // به‌روزرسانی تگ‌ها
      if (tags && Array.isArray(tags)) {
        await EventTag.destroy({ 
          where: { event_id: eventId },
          transaction
        });

        await Promise.all(tags.map(tagId => 
          EventTag.create(
            { 
              event_id: eventId, 
              tag_id: tagId 
            },
            { transaction }
          )
        ));
      }

      // تایید تراکنش
      await transaction.commit();

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
      });

      return { 
        success: true, 
        message: 'رویداد با موفقیت ویرایش شد.',
        event: updatedEvent
      };

    } catch (error) {
      // برگرداندن تراکنش در صورت خطا
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error updating event:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'خطا در ویرایش رویداد.',
    });
  }
});
