// server/api/users/[id]/wallet.put.js
import { User, WalletHistory } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;
  const body = await readBody(event);
  const { wallet_address } = body;

  if (!wallet_address) {
    console.log('Wallet address is missing');
    throw createError({
      statusCode: 400,
      message: 'آدرس کیف‌پول نمی‌تواند خالی باشد.',
    });
  }
  if (!/^((0:[a-fA-F0-9]{64})|([a-zA-Z0-9_-]{48,66}))$/.test(wallet_address)) {
    console.log('Invalid wallet address format:', wallet_address);
    throw createError({
        statusCode: 400,
        message: 'فرمت آدرس کیف‌پول معتبر نیست.',
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

    // ذخیره در تاریخچه کیف‌پول
    await WalletHistory.update({ status: 'inactive' }, { where: { user_id: userId, status: 'active' } });
    await WalletHistory.create({ user_id: userId, wallet_address, status: 'active' });

    // به‌روزرسانی آدرس کیف‌پول
    user.wallet_address = wallet_address;
    await user.save();

    return { success: true, message: 'آدرس کیف‌پول با موفقیت به‌روزرسانی شد.', wallet_address };
  } catch (error) {
    console.error('Error updating wallet address:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در به‌روزرسانی آدرس کیف‌پول.',
    });
  }
});
