// server/api/events/[id]/index.get.js
import { Event } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const eventId = event.context.params.id;

  try {
    const eventData = await Event.findByPk(eventId);

    if (!eventData) {
      throw createError({
        statusCode: 404,
        message: 'رویداد یافت نشد.',
      });
    }

    return { success: true, event: eventData };
  } catch (error) {
    console.error('Error fetching event details:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت جزئیات رویداد.',
    });
  }
});
