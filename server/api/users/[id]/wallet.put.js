// server/api/users/[id]/wallet.put.js
import { User, WalletHistory } from '../../../models/database';
import { checkResourceAccess, requireAdmin } from '../../../middleware/access-control';import { handleApiError } from '../../../utils/error-handler';
import { createResponse } from '../../../utils/response';
import { sequelize } from '../../../models/database';

// اعتبارسنجی آدرس کیف پول
const validateWalletAddress = (address) => {
  if (!address) return false;
  return /^((0:[a-fA-F0-9]{64})|([a-zA-Z0-9_-]{48,66}))$/.test(address);
};

export default defineEventHandler(async (event) => {
  // اعمال middleware ها
  await useAuth(event);
  await checkResourceAccess(event);

  const userId = event.context.params.id;
  const body = await readBody(event);
  const { wallet_address } = body;

  // بررسی داده‌های ورودی
  if (!wallet_address) {
    throw createError({
      statusCode: 400,
      message: 'آدرس کیف پول الزامی است.'
    });
  }

  // اعتبارسنجی فرمت آدرس کیف پول
  if (!validateWalletAddress(wallet_address)) {
    throw createError({
      statusCode: 400,
      message: 'فرمت آدرس کیف پول نامعتبر است.'
    });
  }

  try {
    // شروع تراکنش
    const result = await sequelize.transaction(async (t) => {
      // بررسی تکراری نبودن آدرس کیف پول
      const existingWallet = await User.findOne({
        where: { 
          wallet_address,
          id: { [sequelize.Op.ne]: userId } // به جز خود کاربر
        },
        transaction: t
      });

      if (existingWallet) {
        throw createError({
          statusCode: 409,
          message: 'این آدرس کیف پول قبلاً توسط کاربر دیگری ثبت شده است.'
        });
      }

      // دریافت اطلاعات قبلی کاربر
      const user = await User.findByPk(userId, {
        attributes: ['wallet_address'],
        rejectOnEmpty: true,
        transaction: t
      });

      const oldWalletAddress = user.wallet_address;

      // به‌روزرسانی آدرس کیف پول
      await user.update({ 
        wallet_address,
        updatedAt: new Date()
      }, { transaction: t });

      // ثبت در تاریخچه
      if (oldWalletAddress !== wallet_address) {
        await WalletHistory.create({
          user_id: userId,
          action: 'update_address',
          old_value: oldWalletAddress || '',
          new_value: wallet_address,
          description: 'تغییر آدرس کیف پول',
          created_at: new Date()
        }, { transaction: t });
      }

      return user;
    });

    // برگرداندن پاسخ موفقیت
    return createResponse({
      wallet: {
        address: result.wallet_address,
        last_updated: result.updatedAt
      }
    }, 'آدرس کیف پول با موفقیت به‌روزرسانی شد.');

  } catch (error) {
    handleApiError(error, 'updating wallet address');
  }
});
