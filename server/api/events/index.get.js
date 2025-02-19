// server/api/events/index.get.js
import { Event } from '../../models/database';

export default defineEventHandler(async () => {
  try {
    const events = await Event.findAll({
      where: { status: 'active' },
      order: [['start_time', 'ASC']],
    });

    return { success: true, events };
  } catch (error) {
    console.error('Error fetching events:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت لیست رویدادها.',
    });
  }
});
