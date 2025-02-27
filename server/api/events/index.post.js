import { Event, User, Tag, EventTag } from '../../models/database';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { title, description, option_1, option_2, start_time, end_time, creator_id, tags } = body;

  if (!title || !start_time || !creator_id) {
    throw createError({
      statusCode: 400,
      message: 'عنوان، زمان شروع و شناسه‌ی سازنده الزامی هستند.',
    });
  }

  try {
    const creator = await User.findByPk(creator_id);
    if (!creator) {
      throw createError({
        statusCode: 404,
        message: 'کاربر ایجادکننده یافت نشد.',
      });
    }

    const isAdmin = creator.role === 'admin';
    const newEvent = await Event.create({
      title,
      description,
      option_1,
      option_2,
      start_time,
      end_time,
      creator_id,
      status: isAdmin ? 'active' : 'pending',
    });

    if (tags && Array.isArray(tags)) {
      await Promise.all(tags.map(async (tagId) => {
        const tag = await Tag.findByPk(tagId);
        if (tag) {
          await EventTag.create({ event_id: newEvent.id, tag_id: tagId });
        }
      }));
    }
    // **دریافت مجدد رویداد همراه با تگ‌های آن**
    const eventWithTags = await Event.findByPk(newEvent.id, {
      include: [
        {
          model: Tag,
          through: { attributes: [] }, // عدم نمایش اطلاعات اضافی از جدول EventTag
        },
      ],
    });
    return { success: true, message: 'رویداد ایجاد شد.', event: newEvent };
  } catch (error) {
    console.error('Error creating event:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در ایجاد رویداد.',
    });
  }
});
