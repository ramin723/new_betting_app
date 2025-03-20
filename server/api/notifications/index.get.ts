import { defineEventHandler, createError } from 'h3';
import { Notification } from '../../models/Notification';
import { getServerSession } from '#auth';

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.'
    });
  }

  try {
    const notifications = await Notification.findAll({
      where: {
        user_id: session.user.id,
        is_read: false
      },
      order: [['created_at', 'DESC']],
      limit: 50
    });

    return {
      success: true,
      notifications
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت اعلان‌ها.'
    });
  }
}); 