// server/api/events/[id]/close.post.js
import { Event } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const eventId = event.context.params.id;

  try {
    const eventToClose = await Event.findByPk(eventId);

    if (!eventToClose) {
      throw createError({
        statusCode: 404,
        message: 'رویداد یافت نشد.',
      });
    }

    eventToClose.status = 'closed';
    await eventToClose.save();

    return { success: true, message: 'رویداد با موفقیت بسته شد.' };
  } catch (error) {
    console.error('Error closing event:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در بستن رویداد.',
    });
  }
});
