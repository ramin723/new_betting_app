// server/api/events/index.get.js
import { Op } from 'sequelize';
import { Event, Tag, EventTag } from '../../models/database';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { sort, all, tags } = query;

  try {
    // تنظیم شرط where
    const whereClause = {};

    // اگر all=true نیامده باشد، فقط رویدادهای active را نمایش بده
    if (!all) {
      whereClause.status = 'active';
    }

    // تنظیم مرتب‌سازی پیش‌فرض (start_time ASC)
    let order = [['start_time', 'ASC']];

    // بر اساس sort
    if (sort === 'newest') {
      order = [['createdAt', 'DESC']];
    } else if (sort === 'popular') {
      // فرض کنیم محبوبیت بر اساس total_pool است
      order = [['total_pool', 'DESC']];
    }

    // **فیلتر کردن بر اساس چند تگ (مثلاً tags=Sport,Politics,France)**
    let eventQuery = {
      where: whereClause,
      order,
    };

    if (tags) {
      const tagList = tags.split(','); // تبدیل مقدار `tags` به آرایه‌ای از تگ‌ها

      eventQuery.include = [
        {
          model: Tag,
          where: {
            name: { [Op.in]: tagList }, // هر رویدادی که حداقل یکی از این تگ‌ها را داشته باشد
          },
          through: { attributes: [] },
        },
      ];
    }

    const events = await Event.findAll(eventQuery);

    return { success: true, events };
  } catch (error) {
    console.error('Error fetching events:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت لیست رویدادها.',
    });
  }
});
