import { Tag, User } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const tagId = event.context.params.id;
  const query = getQuery(event);
  const { admin_id } = query;

  try {
    const admin = await User.findByPk(admin_id);
    if (!admin || admin.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'شما اجازه‌ی حذف این تگ را ندارید.',
      });
    }

    const tag = await Tag.findByPk(tagId);
    if (!tag) {
      throw createError({
        statusCode: 404,
        message: 'تگ یافت نشد.',
      });
    }

    await tag.destroy();

    return { success: true, message: 'تگ حذف شد.' };
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در حذف تگ.',
    });
  }
});
