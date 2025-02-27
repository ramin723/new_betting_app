import { Tag, User } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const tagId = event.context.params.id;
  const body = await readBody(event);
  const { name, admin_id } = body;

  try {
    const admin = await User.findByPk(admin_id);
    if (!admin || admin.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'شما اجازه‌ی ویرایش این تگ را ندارید.',
      });
    }

    const tag = await Tag.findByPk(tagId);
    if (!tag) {
      throw createError({
        statusCode: 404,
        message: 'تگ یافت نشد.',
      });
    }

    tag.name = name || tag.name;
    tag.status = 'approved'; // تأیید شدن تگ در صورت ویرایش
    await tag.save();

    return { success: true, message: 'تگ با موفقیت ویرایش شد.', tag };
  } catch (error) {
    console.error('Error updating tag:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در ویرایش تگ.',
    });
  }
});
