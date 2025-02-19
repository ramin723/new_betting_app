// server/api/admin/bets/user/[id]/index.get.js
import { Op } from 'sequelize';
import { Bet } from '../../../../../models/database';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.id;
  const query = getQuery(event); // گرفتن فیلترها از query string

  const { start_date, end_date, status, event_id } = query;

  try {
    // تنظیم شرط‌های جستجو
    const whereClause = { user_id: userId };

    // فیلتر بر اساس زمان
    if (start_date || end_date) {
      whereClause.createdAt = {};
      if (start_date) whereClause.createdAt[Op.gte] = new Date(start_date);
      if (end_date) whereClause.createdAt[Op.lte] = new Date(end_date);
    }

    // فیلتر بر اساس وضعیت
    if (status) {
      whereClause.status = status;
    }

    // فیلتر بر اساس event_id
    if (event_id) {
      whereClause.event_id = event_id;
    }

    // اجرای کوئری
    const userBets = await Bet.findAll({
      where: whereClause,
      attributes: ['id', 'event_id', 'bet_option', 'bet_amount', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    return { success: true, bets: userBets };
  } catch (error) {
    console.error('Error fetching bets with filters (admin):', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت شرط‌بندی‌های کاربر با فیلترها.',
    });
  }
});
