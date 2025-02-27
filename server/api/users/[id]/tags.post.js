import { User, Tag, UserPreference } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;
  const body = await readBody(event);
  const { tagIds } = body;

  if (!Array.isArray(tagIds) || tagIds.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'حداقل یک تگ باید انتخاب شود.',
    });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'کاربر یافت نشد.',
      });
    }

    await UserPreference.destroy({ where: { user_id: userId } }); // حذف تگ‌های قبلی
    await Promise.all(tagIds.map(tagId => UserPreference.create({ user_id: userId, tag_id: tagId })));

    return { success: true, message: 'تگ‌های کاربر بروزرسانی شد.' };
  } catch (error) {
    console.error('Error updating user tags:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در بروزرسانی تگ‌های کاربر.',
    });
  }
});
