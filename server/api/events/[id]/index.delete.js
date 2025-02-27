// server/api/events/[id]/index.delete.js
import { Event, Bet, User } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const eventId = event.context.params.id;
  const query = getQuery(event);
  const { admin_id } = query; // ادمین باید درخواست حذف بدهد

  try {
    // بررسی اینکه کاربر ادمین است یا نه
    const admin = await User.findByPk(admin_id);
    if (!admin || admin.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'شما اجازه‌ی حذف این رویداد را ندارید.',
      });
    }

    // بررسی اینکه آیا رویداد وجود دارد
    const existingEvent = await Event.findByPk(eventId);
    if (!existingEvent) {
      throw createError({
        statusCode: 404,
        message: 'رویداد یافت نشد.',
      });
    }

    // بررسی اینکه آیا روی این رویداد شرط‌بندی انجام شده یا نه
    const betCount = await Bet.count({ where: { event_id: eventId } });

    if (existingEvent.status === 'active' && betCount > 0) {
      // اگر روی رویداد شرط‌بندی شده، نباید حذف شود، بلکه وضعیت آن `canceled` شود
      existingEvent.status = 'canceled';
      await existingEvent.save();
      return { success: true, message: 'رویداد دارای شرط‌بندی بوده، پس به‌جای حذف لغو شد.' };
    }

    // اگر شرطی روی آن ثبت نشده، می‌توان آن را حذف کرد
    await existingEvent.destroy();

    return { success: true, message: 'رویداد با موفقیت حذف شد.' };
  } catch (error) {
    console.error('Error deleting event:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در حذف رویداد.',
    });
  }
});
