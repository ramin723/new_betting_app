import { EventTemplate } from '../../../models/database';

export default defineEventHandler(async (event) => {
  const id = event.context.params.id;

  try {
    const template = await EventTemplate.findByPk(id);
    
    if (!template) {
      throw createError({
        statusCode: 404,
        message: 'قالب مورد نظر یافت نشد.',
      });
    }

    return {
      success: true,
      template
    };
  } catch (error) {
    console.error('Error fetching template:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'خطا در دریافت اطلاعات قالب.',
    });
  }
}); 