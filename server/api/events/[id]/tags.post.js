import { Event, Tag, EventTag } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const eventId = event.context.params.id;
  const body = await readBody(event);
  const { tagId } = body;

  try {
    const eventExists = await Event.findByPk(eventId);
    const tagExists = await Tag.findByPk(tagId);

    if (!eventExists || !tagExists) {
      throw createError({
        statusCode: 404,
        message: 'رویداد یا تگ یافت نشد.',
      });
    }

    await EventTag.create({ event_id: eventId, tag_id: tagId });

    return { success: true, message: 'تگ به رویداد اضافه شد.' };
  } catch (error) {
    console.error('Error adding tag to event:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در افزودن تگ به رویداد.',
    });
  }
});
