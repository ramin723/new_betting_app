import { Event } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const eventId = event.context.params.id;

  try {
    const existingEvent = await Event.findByPk(eventId);
    if (!existingEvent || existingEvent.status !== 'pending') {
      throw createError({
        statusCode: 404,
        message: 'رویداد یافت نشد یا قبلاً تایید شده است.',
      });
    }

    existingEvent.status = 'active';
    await existingEvent.save();

    return { success: true, message: 'رویداد تایید شد.', event: existingEvent };
  } catch (error) {
    console.error('Error approving event:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در تایید رویداد.',
    });
  }
});
