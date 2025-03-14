import { defineEventHandler, createError, getRouterParams } from 'h3';

/**
 * بررسی دسترسی به منابع کاربر
 * این middleware بررسی می‌کند که آیا کاربر مجاز به دسترسی به منابع کاربر دیگر هست یا نه
 */
const checkResourceAccess = defineEventHandler(async (event) => {
  const { auth } = event.context;
  const params = getRouterParams(event);
  const targetUserId = params?.id;

  if (!targetUserId) {
    return; // اگر ID وجود نداشت، اجازه عبور می‌دهیم (برای API هایی که به ID نیاز ندارند)
  }

  if (auth.role === 'admin' || targetUserId === auth.userId) {
    return;
  }

  throw createError({
    statusCode: 403,
    message: 'شما مجاز به دسترسی به این اطلاعات نیستید.'
  });
});

/**
 * بررسی نقش ادمین
 * این middleware فقط به ادمین‌ها اجازه دسترسی می‌دهد
 */
const requireAdmin = defineEventHandler(async (event) => {
  const { auth } = event.context;

  if (!auth) {
    throw createError({
      statusCode: 401,
      message: 'لطفا وارد حساب کاربری خود شوید.'
    });
  }

  if (auth.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'فقط ادمین‌ها مجاز به انجام این عملیات هستند.'
    });
  }
});

/**
 * بررسی نقش‌های مجاز
 * این middleware بررسی می‌کند که آیا کاربر نقش مورد نیاز را دارد یا نه
 */
const checkRole = (allowedRoles) => {
  return defineEventHandler(async (event) => {
    const { auth } = event.context;

    if (!auth) {
      throw createError({
        statusCode: 401,
        message: 'لطفا وارد حساب کاربری خود شوید.'
      });
    }

    if (!allowedRoles.includes(auth.role)) {
      throw createError({
        statusCode: 403,
        message: 'شما مجاز به انجام این عملیات نیستید.'
      });
    }
  });
};

export { checkResourceAccess, requireAdmin, checkRole };
export default checkResourceAccess; 