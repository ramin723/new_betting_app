import { User, Tag, Event, sequelize } from '../../../models/database';
import { checkResourceAccess, requireAdmin } from '../../../middleware/access-control';import { handleApiError } from '../../../utils/error-handler';
import { createPaginatedResponse } from '../../../utils/response';

export default defineEventHandler(async (event) => {
  // اعمال middleware ها
  await useAuth(event);
  await checkResourceAccess(event);

  const userId = event.context.params.id;
  const query = getQuery(event);
  
  // پارامترهای فیلتر و صفحه‌بندی
  const page = parseInt(query.page) || 1;
  const pageSize = parseInt(query.page_size) || 20;
  const type = query.type || null;
  const search = query.search || null;
  const sortBy = ['name', 'usage_count', 'created_at'].includes(query.sort_by) 
    ? query.sort_by 
    : 'created_at';
  const sortOrder = query.sort_order === 'asc' ? 'ASC' : 'DESC';

  try {
    // ساخت شرط‌های جستجو
    const whereClause = {};
    if (type) {
      whereClause.type = type;
    }
    if (search) {
      whereClause.name = { [sequelize.Op.like]: `%${search}%` };
    }

    // دریافت تگ‌ها با آمار استفاده
    const { count, rows } = await Tag.findAndCountAll({
      include: [
        {
          model: User,
          where: { id: userId },
          through: { 
            attributes: ['created_at'],
          },
          required: true
        },
        {
          model: Event,
          attributes: ['id', 'status'],
          through: { attributes: [] },
          required: false
        }
      ],
      where: whereClause,
      attributes: [
        'id',
        'name',
        'type',
        'description',
        [sequelize.fn('COUNT', sequelize.col('Events.id')), 'usage_count'],
        [
          sequelize.fn(
            'SUM', 
            sequelize.literal("CASE WHEN Events.status = 'active' THEN 1 ELSE 0 END")
          ),
          'active_events'
        ]
      ],
      group: ['Tag.id', 'Users.id'],
      order: [
        sortBy === 'name' 
          ? ['name', sortOrder]
          : sortBy === 'usage_count'
          ? [sequelize.literal('usage_count'), sortOrder]
          : [sequelize.col('Users->UserTags.created_at'), sortOrder]
      ],
      offset: (page - 1) * pageSize,
      limit: pageSize,
      subQuery: false
    });

    // تبدیل نتایج به فرمت مناسب
    const formattedTags = rows.map(tag => ({
      id: tag.id,
      name: tag.name,
      type: tag.type,
      description: tag.description,
      stats: {
        usage_count: parseInt(tag.getDataValue('usage_count')),
        active_events: parseInt(tag.getDataValue('active_events')),
      },
      added_at: tag.Users[0].UserTags.created_at
    }));

    // برگرداندن پاسخ با صفحه‌بندی
    return createPaginatedResponse(
      formattedTags,
      count.length, // تعداد کل رکوردها
      page,
      pageSize,
      'تگ‌های کاربر با موفقیت دریافت شد.'
    );

  } catch (error) {
    handleApiError(error, 'fetching user tags');
  }
});
