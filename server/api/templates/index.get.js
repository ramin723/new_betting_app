import { EventTemplate } from '../../models/database';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { type, active_only } = query;

  try {
    const whereClause = {};
    
    // فیلتر بر اساس نوع قالب
    if (type) {
      whereClause.type = type;
    }
    
    // فیلتر قالب‌های فعال
    if (active_only === 'true') {
      whereClause.is_active = true;
    }

    const templates = await EventTemplate.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });

    return {
      success: true,
      templates
    };
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت لیست قالب‌ها.',
    });
  }
}); 