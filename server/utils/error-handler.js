/**
 * تبدیل خطاهای مختلف به فرمت استاندارد
 * این تابع خطاهای مختلف را به یک فرمت استاندارد تبدیل می‌کند
 */
export const handleApiError = (error, operation) => {
  console.error(`Error in ${operation}:`, error);

  // خطاهای validation
  if (error.name === 'SequelizeValidationError') {
    throw createError({
      statusCode: 400,
      data: error.errors.map(err => ({
        field: err.path,
        message: err.message
      })),
      message: 'داده‌های ورودی نامعتبر هستند.'
    });
  }

  // خطاهای unique constraint
  if (error.name === 'SequelizeUniqueConstraintError') {
    throw createError({
      statusCode: 409,
      data: error.errors.map(err => ({
        field: err.path,
        message: err.message
      })),
      message: 'این داده قبلاً ثبت شده است.'
    });
  }

  // خطاهای foreign key
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    throw createError({
      statusCode: 400,
      message: 'داده‌های ارجاع شده معتبر نیستند.'
    });
  }

  // خطای عدم وجود رکورد
  if (error.name === 'SequelizeEmptyResultError') {
    throw createError({
      statusCode: 404,
      message: 'داده مورد نظر یافت نشد.'
    });
  }

  // اگر خطا از قبل createError شده باشد
  if (error.statusCode) {
    throw error;
  }

  // سایر خطاها
  throw createError({
    statusCode: 500,
    message: 'خطای سرور رخ داده است.'
  });
}; 