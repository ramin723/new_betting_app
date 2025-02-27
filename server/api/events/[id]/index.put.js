// server/api/events/[id].put.js
import { Event, Tag, EventTag, User } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const eventId = event.context.params.id;
  const body = await readBody(event);
  const { title, description, start_time, end_time, option_1, option_2, tags, admin_id } = body;

  try {
    // بررسی دسترسی ادمین
    const admin = await User.findByPk(admin_id);
    if (!admin || admin.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'شما اجازه‌ی ویرایش این رویداد را ندارید.',
      });
    }

    // پیدا کردن رویداد
    const existingEvent = await Event.findByPk(eventId);
    if (!existingEvent) {
      throw createError({
        statusCode: 404,
        message: 'رویداد موردنظر یافت نشد.',
      });
    }

    // به‌روزرسانی اطلاعات مجاز
    existingEvent.title = title || existingEvent.title;
    existingEvent.description = description || existingEvent.description;
    existingEvent.start_time = start_time || existingEvent.start_time;
    existingEvent.end_time = end_time || existingEvent.end_time;
    existingEvent.option_1 = option_1 || existingEvent.option_1;
    existingEvent.option_2 = option_2 || existingEvent.option_2;

    await existingEvent.save();

    // **به‌روزرسانی تگ‌های رویداد**
    if (tags && Array.isArray(tags)) {
      // حذف تگ‌های قبلی این رویداد
      await EventTag.destroy({ where: { event_id: eventId } });

      // افزودن تگ‌های جدید
      await Promise.all(tags.map(async (tagId) => {
        const tagExists = await Tag.findByPk(tagId);
        if (tagExists) {
          await EventTag.create({ event_id: eventId, tag_id: tagId });
        }
      }));
    }

    return { success: true, message: 'رویداد با موفقیت ویرایش شد.', event: existingEvent };
  } catch (error) {
    console.error('Error updating event:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در ویرایش رویداد.',
    });
  }
});
