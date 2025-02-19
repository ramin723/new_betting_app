// server/api/events/index.post.js
import { Event } from '../../models/database';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { title, description, option_1, option_2, start_time, end_time } = body;

  if (!title || !start_time) {
    throw createError({
      statusCode: 400,
      message: 'عنوان و زمان شروع الزامی هستند.',
    });
  }

  try {
    const newEvent = await Event.create({
      title,
      description,
      option_1,
      option_2,
      start_time,
      end_time,
      status: 'active',
    });

    return { success: true, message: 'رویداد با موفقیت ایجاد شد.', event: newEvent };
  } catch (error) {
    console.error('Error creating event:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در ایجاد رویداد.',
    });
  }
});
