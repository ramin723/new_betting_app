import { Tag } from '../../models/database';

export default defineEventHandler(async () => {
  try {
    const tags = await Tag.findAll({
      include: [
        {
          model: Tag,
          as: 'children',
          required: false,
        },
      ],
      order: [['id', 'ASC']],
    });

    return { success: true, tags };
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت لیست تگ‌ها.',
    });
  }
});
