/**
 * ایجاد پاسخ موفقیت‌آمیز استاندارد
 */
export const createResponse = (data = null, message = '') => ({
  success: true,
  data,
  message
});

/**
 * ایجاد پاسخ صفحه‌بندی شده
 */
export const createPaginatedResponse = (items, totalItems, page, pageSize, message = '') => ({
  success: true,
  data: {
    items,
    pagination: {
      total_items: totalItems,
      total_pages: Math.ceil(totalItems / pageSize),
      current_page: page,
      page_size: pageSize,
      has_next: page * pageSize < totalItems,
      has_previous: page > 1
    }
  },
  message
});

/**
 * ایجاد پاسخ خطا
 */
export const createErrorResponse = (error) => ({
  success: false,
  error: {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message || 'خطای ناشناخته',
    details: error.data
  }
}); 