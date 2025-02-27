// server/api/users/[id]/preferences.put.js
import { UserPreference } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;
  const body = await readBody(event);
  const { tags } = body; // لیستی از تگ‌های انتخابی کاربر

  if (!Array.isArray(tags)) {
    throw createError({
      statusCode: 400,
      message: 'تگ‌ها باید به صورت یک آرایه ارسال شوند.',
    });
  }

  try {
    // حذف تگ‌های قبلی کاربر
    await UserPreference.destroy({ where: { user_id: userId } });

    // ذخیره‌ی تگ‌های جدید
    const preferences = tags.map((tag_id) => ({ user_id: userId, tag_id }));
    await UserPreference.bulkCreate(preferences);

    return { success: true, message: 'تگ‌های منتخب با موفقیت ذخیره شدند.' };
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در ذخیره‌ی تگ‌های منتخب.',
    });
  }
});
