import { User, Tag, sequelize } from '../../../models/database';
import { checkResourceAccess, requireAdmin } from '../../../middleware/access-control';import { handleApiError } from '../../../utils/error-handler';
import { createResponse } from '../../../utils/response';

// اعتبارسنجی عملیات تگ
const validateTagOperation = (operation, tags) => {
  const validOperations = ['add', 'remove', 'set'];
  if (!validOperations.includes(operation)) {
    throw createError({
      statusCode: 400,
      message: 'عملیات نامعتبر است. عملیات‌های مجاز: add, remove, set'
    });
  }

  if (!Array.isArray(tags)) {
    throw createError({
      statusCode: 400,
      message: 'تگ‌ها باید به صورت آرایه ارسال شوند.'
    });
  }

  if (tags.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'حداقل یک تگ باید ارسال شود.'
    });
  }

  // بررسی حداکثر تعداد مجاز تگ
  if (operation !== 'remove' && tags.length > 20) {
    throw createError({
      statusCode: 400,
      message: 'حداکثر تعداد تگ مجاز 20 عدد است.'
    });
  }
};

export default defineEventHandler(async (event) => {
  // اعمال middleware ها
  await useAuth(event);
  await checkResourceAccess(event);

  const userId = event.context.params.id;
  const body = await readBody(event);
  const { operation = 'add', tags: tagIds } = body;

  // اعتبارسنجی ورودی‌ها
  validateTagOperation(operation, tagIds);

  try {
    // شروع تراکنش
    const result = await sequelize.transaction(async (t) => {
      // دریافت کاربر
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Tag,
            through: { attributes: ['created_at'] }
          }
        ],
        rejectOnEmpty: true,
        transaction: t
      });

      // دریافت تگ‌های معتبر
      const validTags = await Tag.findAll({
        where: { id: tagIds },
        transaction: t
      });

      if (validTags.length !== tagIds.length) {
        throw createError({
          statusCode: 400,
          message: 'برخی از تگ‌های ارسال شده معتبر نیستند.'
        });
      }

      // انجام عملیات درخواستی
      switch (operation) {
        case 'add':
          await user.addTags(validTags, {
            transaction: t,
            through: { created_at: new Date() }
          });
          break;

        case 'remove':
          await user.removeTags(validTags, { transaction: t });
          break;

        case 'set':
          await user.setTags(validTags, {
            transaction: t,
            through: { created_at: new Date() }
          });
          break;
      }

      // دریافت لیست به‌روز شده تگ‌ها
      await user.reload({
        include: [
          {
            model: Tag,
            through: { attributes: ['created_at'] }
          }
        ],
        transaction: t
      });

      return user;
    });

    // آماده‌سازی پاسخ
    const response = {
      tags: result.Tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        type: tag.type,
        description: tag.description,
        added_at: tag.UserTags.created_at
      }))
    };

    const messages = {
      add: 'تگ‌های جدید با موفقیت اضافه شدند.',
      remove: 'تگ‌های انتخاب شده با موفقیت حذف شدند.',
      set: 'لیست تگ‌ها با موفقیت به‌روزرسانی شد.'
    };

    return createResponse(response, messages[operation]);

  } catch (error) {
    handleApiError(error, 'managing user tags');
  }
});
