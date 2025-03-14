// server/api/users/[id]/preferences.put.js
import { User, Tag, UserPreference, sequelize } from '../../../models/database';
import { checkResourceAccess, requireAdmin } from '../../../middleware/access-control';import { handleApiError } from '../../../utils/error-handler';
import { createResponse } from '../../../utils/response';

// اعتبارسنجی تنظیمات اعلان‌ها
const validateNotificationPreferences = (prefs) => {
  if (!prefs || typeof prefs !== 'object') return false;
  const allowedKeys = ['email', 'push', 'telegram'];
  return Object.keys(prefs).every(key => 
    allowedKeys.includes(key) && typeof prefs[key] === 'boolean'
  );
};

// اعتبارسنجی تنظیمات محلی‌سازی
const validateLocalization = (local) => {
  if (!local || typeof local !== 'object') return false;
  const allowedLanguages = ['fa', 'en'];
  const allowedTimezones = ['Asia/Tehran', 'UTC'];
  return (
    allowedLanguages.includes(local.language) &&
    allowedTimezones.includes(local.timezone)
  );
};

export default defineEventHandler(async (event) => {
  // اعمال middleware ها
  await useAuth(event);
  await checkResourceAccess(event);

  const userId = event.context.params.id;
  const body = await readBody(event);
  const { notification, localization, tags, other } = body;

  try {
    // شروع تراکنش
    const result = await sequelize.transaction(async (t) => {
      // دریافت کاربر
      const user = await User.findByPk(userId, {
        rejectOnEmpty: true,
        transaction: t
      });

      // به‌روزرسانی تنظیمات اعلان‌ها
      if (notification) {
        if (!validateNotificationPreferences(notification)) {
          throw createError({
            statusCode: 400,
            message: 'تنظیمات اعلان‌ها نامعتبر است.'
          });
        }
        await user.update({ 
          notification_preferences: notification 
        }, { transaction: t });
      }

      // به‌روزرسانی تنظیمات محلی‌سازی
      if (localization) {
        if (!validateLocalization(localization)) {
          throw createError({
            statusCode: 400,
            message: 'تنظیمات محلی‌سازی نامعتبر است.'
          });
        }
        await user.update({
          language: localization.language,
          timezone: localization.timezone
        }, { transaction: t });
      }

      // به‌روزرسانی تگ‌ها
      if (tags) {
        if (!Array.isArray(tags)) {
          throw createError({
            statusCode: 400,
            message: 'فرمت تگ‌ها نامعتبر است.'
          });
        }

        // حذف تگ‌های قبلی
        await user.setTags([], { transaction: t });

        // افزودن تگ‌های جدید
        if (tags.length > 0) {
          const validTags = await Tag.findAll({
            where: { id: tags },
            transaction: t
          });

          await user.addTags(validTags, { 
            transaction: t,
            through: { created_at: new Date() }
          });
        }
      }

      // به‌روزرسانی سایر تنظیمات
      if (other && typeof other === 'object') {
        const updates = Object.entries(other).map(([key, value]) => 
          UserPreference.upsert({
            user_id: userId,
            key,
            value: JSON.stringify(value),
            updated_at: new Date()
          }, { transaction: t })
        );
        await Promise.all(updates);
      }

      // بازیابی تنظیمات به‌روز شده
      const updatedUser = await User.findByPk(userId, {
        attributes: ['notification_preferences', 'language', 'timezone'],
        include: [
          {
            model: Tag,
            through: { attributes: ['created_at'] }
          }
        ],
        transaction: t
      });

      const updatedPreferences = await UserPreference.findAll({
        where: { user_id: userId },
        attributes: ['key', 'value', 'updated_at'],
        transaction: t
      });

      return {
        user: updatedUser,
        preferences: updatedPreferences
      };
    });

    // آماده‌سازی پاسخ
    const response = {
      notification: result.user.notification_preferences,
      localization: {
        language: result.user.language,
        timezone: result.user.timezone
      },
      tags: result.user.Tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        type: tag.type,
        added_at: tag.UserTags.created_at
      })),
      other: result.preferences.reduce((acc, pref) => {
        acc[pref.key] = {
          value: JSON.parse(pref.value),
          last_updated: pref.updated_at
        };
        return acc;
      }, {})
    };

    return createResponse(response, 'تنظیمات کاربر با موفقیت به‌روزرسانی شد.');

  } catch (error) {
    handleApiError(error, 'updating user preferences');
  }
});
