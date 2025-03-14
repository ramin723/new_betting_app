import { User, Tag, UserPreference } from '../../../models/database';
import { checkResourceAccess, requireAdmin } from '../../../middleware/access-control';import { handleApiError } from '../../../utils/error-handler';
import { createResponse } from '../../../utils/response';

export default defineEventHandler(async (event) => {
  // اعمال middleware ها
  await useAuth(event);
  await checkResourceAccess(event);

  const userId = event.context.params.id;
  const query = getQuery(event);
  const tagType = query.tag_type || null;

  try {
    // دریافت تنظیمات پایه کاربر
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'notification_preferences', 'language', 'timezone'],
      include: [
        {
          model: Tag,
          through: { attributes: ['created_at'] },
          where: tagType ? { type: tagType } : {},
          required: false
        }
      ],
      rejectOnEmpty: true
    });

    // دریافت سایر تنظیمات از جدول UserPreference
    const additionalPreferences = await UserPreference.findAll({
      where: { user_id: userId },
      attributes: ['key', 'value', 'updated_at']
    });

    // تبدیل تنظیمات اضافی به یک آبجکت
    const otherPreferences = additionalPreferences.reduce((acc, pref) => {
      acc[pref.key] = {
        value: pref.value,
        last_updated: pref.updated_at
      };
      return acc;
    }, {});

    // آماده‌سازی پاسخ
    const preferences = {
      notification: {
        email: user.notification_preferences?.email || false,
        push: user.notification_preferences?.push || false,
        telegram: user.notification_preferences?.telegram || false
      },
      localization: {
        language: user.language || 'fa',
        timezone: user.timezone || 'Asia/Tehran'
      },
      tags: user.Tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        type: tag.type,
        added_at: tag.UserTags.created_at
      })),
      other: otherPreferences
    };

    return createResponse(preferences, 'تنظیمات کاربر با موفقیت دریافت شد.');

  } catch (error) {
    handleApiError(error, 'fetching user preferences');
  }
});
