// server/api/events/filter.get.js
import { Event, EventTag, Tag } from '../../models/database.js';


export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const tagIds = query.tags ? query.tags.split(',').map(Number) : [];

  try {
    if (tagIds.length === 0) {
      // اگر تگی انتخاب نشده، نمایش تمام رویدادها
      const events = await Event.findAll();
      return { success: true, events };
    }

    // دریافت رویدادهایی که دارای تگ‌های انتخاب شده هستند
    const events = await Event.findAll({
      include: [
        {
          model: Tag,
          where: { id: tagIds },
          through: { attributes: [] }, // عدم نمایش جزئیات EventTag
        },
      ],
    });

    return { success: true, events };
  } catch (error) {
    console.error('Error filtering events:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در فیلتر کردن رویدادها.',
    });
  }
});
