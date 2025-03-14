import { User } from '../models/database';
import { defineEventHandler, getCookie, createError } from 'h3';
import { useRuntimeConfig } from '#imports';
import jwt from 'jsonwebtoken';
import { AUTH_CONSTANTS } from '../constants/auth';
import type { UserModel } from '~/types/models';

// لیست مسیرهایی که نیاز به احراز هویت دارند
const protectedPaths = [
  '/api/events/create',
  '/api/events/*/edit',
  '/api/events/*/delete',
  '/api/bets/*',
  '/api/user/profile',
  '/api/user/wallet',
  '/dashboard'
] as const;

interface TelegramUser {
  telegramId: string;
  username?: string;
  firstName: string;
  lastName?: string;
}

interface AuthSession {
  userId: string;
  username: string;
  role: string;
  telegramId?: string;
}

/**
 * بررسی می‌کند که آیا مسیر نیاز به احراز هویت دارد
 */
const isProtectedPath = (path: string): boolean => {
  if (!path) return false;
  
  return protectedPaths.some(protectedPath => {
    if (protectedPath.includes('*')) {
      const pattern = new RegExp('^' + protectedPath.replace('*', '.*') + '$');
      return pattern.test(path);
    }
    return path === protectedPath;
  });
};

/**
 * دریافت اطلاعات کاربر از تلگرام (فقط در محیط production)
 */
const getTelegramUser = (event: any): TelegramUser | null => {
  const initData = event.node.req.headers['x-telegram-init-data'];
  if (!initData) return null;

  try {
    const telegramData = new URLSearchParams(initData);
    const user = JSON.parse(telegramData.get('user') || '');
    return {
      telegramId: user.id.toString(),
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name
    };
  } catch (error) {
    console.error('Error parsing Telegram data:', error);
    return null;
  }
};

/**
 * دریافت اطلاعات کاربر از توکن (برای محیط development)
 */
const getDevUser = async (event: any): Promise<AuthSession | null> => {
  const config = useRuntimeConfig();
  const token = getCookie(event, config.auth?.cookieName || AUTH_CONSTANTS.DEFAULT_COOKIE_NAME);
  
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, config.auth?.secret || AUTH_CONSTANTS.DEFAULT_JWT_SECRET) as { userId: number };
    const user = await User.findByPk(decoded.userId) as unknown as UserModel;
    
    if (!user || !user.id || !user.username || !user.role) return null;

    return {
      userId: user.id.toString(),
      username: user.username,
      role: user.role
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};

/**
 * middleware احراز هویت
 */
const useAuth = defineEventHandler(async (event) => {
  const url = event.path || event.node.req.url || '/';
  console.log('🔵 Auth middleware checking path:', url);

  // اگر مسیر نیاز به احراز هویت ندارد
  if (!isProtectedPath(url)) {
    console.log('🟡 Public path, skipping auth check');
    return;
  }

  const config = useRuntimeConfig();
  const isDev = process.env.NODE_ENV !== 'production';

  // در محیط development از سیستم لاگین ساده استفاده می‌کنیم
  if (isDev) {
    const session = await getDevUser(event);
    if (!session) {
      throw createError({
        statusCode: 401,
        message: 'لطفا وارد حساب کاربری خود شوید.'
      });
    }
    event.context.auth = session;
    return;
  }

  // در محیط production از Telegram WebApp استفاده می‌کنیم
  const telegramUser = getTelegramUser(event);
  if (!telegramUser) {
    throw createError({
      statusCode: 401,
      message: 'لطفاً از طریق تلگرام وارد شوید.'
    });
  }

  let user = await User.findOne({
    where: { telegram_id: telegramUser.telegramId }
  }) as unknown as UserModel;

  if (!user) {
    const defaultUsername = `user${telegramUser.telegramId}`;
    user = await User.create({
      telegram_id: telegramUser.telegramId,
      username: telegramUser.username || defaultUsername,
      first_name: telegramUser.firstName,
      last_name: telegramUser.lastName || '',
      role: 'user'
    }) as unknown as UserModel;
  }

  if (!user.id || !user.username || !user.role) {
    throw createError({
      statusCode: 500,
      message: 'خطا در ایجاد حساب کاربری'
    });
  }

  event.context.auth = {
    userId: user.id.toString(),
    username: user.username,
    role: user.role,
    telegramId: telegramUser.telegramId
  };
});

export { useAuth };
export default useAuth; 