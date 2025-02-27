// server/api/events/[id]/referrals.get.js
import { EventReferral, User } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const eventId = event.context.params.id;

  try {
    // دریافت لیست کاربران دعوت‌شده برای این رویداد
    const referrals = await EventReferral.findAll({
      where: { event_id: eventId },
      include: [
        {
          model: User,
          as: 'referrer',
          attributes: ['id', 'username'],
        },
        {
          model: User,
          as: 'referred',
          attributes: ['id', 'username'],
        }
      ]
    });

    return { success: true, referrals };
  } catch (error) {
    console.error('Error fetching event referrals:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت اطلاعات دعوت‌شدگان این رویداد.',
    });
  }
});
