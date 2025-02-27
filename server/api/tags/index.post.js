import { Tag, User } from '../../models/database';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, parent_id, creator_id } = body;

  if (!name) {
    throw createError({
      statusCode: 400,
      message: 'نام تگ الزامی است.',
    });
  }

  try {
    // بررسی اینکه آیا تگ از قبل وجود دارد
    const existingTag = await Tag.findOne({ where: { name } });
    if (existingTag) {
      throw createError({
        statusCode: 400,
        message: 'این تگ از قبل وجود دارد.',
      });
    }

    const creator = await User.findByPk(creator_id);
    if (!creator) {
      throw createError({
        statusCode: 404,
        message: 'کاربر ایجادکننده یافت نشد.',
      });
    }

    const isAdmin = creator.role === 'admin';

    const tag = await Tag.create({
      name,
      parent_id: parent_id || null,
      status: isAdmin ? 'approved' : 'pending',
    });

    return { success: true, message: 'تگ ایجاد شد.', tag };
  } catch (error) {
    console.error('Error creating tag:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در ایجاد تگ.',
    });
  }
});
