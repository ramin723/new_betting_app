import { User } from '../../../models/database';
import { checkResourceAccess, requireAdmin } from '../../../middleware/access-control';import { handleApiError } from '../../../utils/error-handler';
import { createResponse } from '../../../utils/response';

export default defineEventHandler(async (event) => {
  // اعمال middleware ها
  await useAuth(event);
  await checkResourceAccess(event);

  const userId = event.context.params.id;

  try {
    const user = await User.findByPk(userId, {
      attributes: [
        'wallet_address',
        'balance',
        'total_bets',
        'total_wins',
        'updatedAt'
      ],
      rejectOnEmpty: true
    });

    // محاسبه آمار اضافی
    const stats = {
      win_rate: user.total_bets > 0 
        ? ((user.total_wins / user.total_bets) * 100).toFixed(2)
        : 0
    };

    return createResponse({
      wallet: {
        address: user.wallet_address,
        balance: user.balance,
        last_updated: user.updatedAt
      },
      stats,
      permissions: {
        can_withdraw: user.balance > 0,
        can_delete: false // فعلاً غیرفعال است
      }
    }, 'اطلاعات کیف پول با موفقیت دریافت شد.');

  } catch (error) {
    handleApiError(error, 'fetching wallet info');
  }
});
