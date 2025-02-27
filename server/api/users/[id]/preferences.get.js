import { User, Tag } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;

  try {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Tag,
          through: { attributes: [] }, // حذف اطلاعات اضافی جدول واسط
        },
      ],
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'کاربر یافت نشد.',
      });
    }

    return { success: true, preferences: user.Tags };
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت تگ‌های منتخب کاربر.',
    });
  }
});
