import { Event, UserPreference, EventTag } from '../../../models/database';
import { Op } from 'sequelize';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;

  try {
    const userTags = await UserPreference.findAll({
      where: { user_id: userId },
      attributes: ['tag_id'],
    });

    if (userTags.length === 0) {
      return { success: true, events: [] }; // کاربر هیچ تگی انتخاب نکرده است
    }

    const tagIds = userTags.map((pref) => pref.tag_id);

    const events = await Event.findAll({
      where: {
        id: {
          [Op.in]: sequelize.literal(
            `(SELECT event_id FROM EventTags WHERE tag_id IN (${tagIds.join(',')}))`
          ),
        },
        status: 'active',
      },
    });

    return { success: true, events };
  } catch (error) {
    console.error('Error fetching events by user tags:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت رویدادها بر اساس تگ‌های منتخب.',
    });
  }
});
