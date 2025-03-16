/**
 * مقادیر ثابت سیستم
 */

// کمسیون‌ها
export const COMMISSIONS = {
  CREATOR: 0.02, // 2% کمسیون سازنده رویداد
  REFERRAL: 0.05, // 5% کمسیون دعوت
} as const;

// وضعیت‌های رویداد
export const EVENT_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  ACTIVE: 'active',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
} as const;

// نوع رویدادها
export const EVENT_TYPES = {
  YES_NO: 'yes_no',
  WINNER: 'winner',
  CUSTOM: 'custom',
} as const;

// وضعیت شرط‌ها
export const BET_STATUS = {
  ACTIVE: 'active',
  WON: 'won',
  LOST: 'lost',
  CANCELLED: 'cancelled',
} as const;

// نقش‌های کاربری
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

// تنظیمات پایگاه داده
export const DB_CONFIG = {
  POOL: {
    MAX: 5,
    MIN: 0,
    ACQUIRE: 30000,
    IDLE: 10000,
  },
  SYNC_OPTIONS: {
    FORCE: false,
    ALTER: false,
  },
} as const;

// تنظیمات امنیتی
export const SECURITY = {
  PASSWORD_MIN_LENGTH: 8,
  TOKEN_EXPIRY: '24h',
  REFRESH_TOKEN_EXPIRY: '7d',
} as const;

// تنظیمات کیف پول
export const WALLET = {
  MIN_BET_AMOUNT: 0.1,
  MAX_BET_AMOUNT: 1000,
  MIN_WITHDRAWAL: 10,
  MAX_WITHDRAWAL: 10000,
} as const;

// تنظیمات رویداد
export const EVENT = {
  MIN_BETTING_TIME: 5 * 60 * 1000, // 5 دقیقه
  MAX_BETTING_TIME: 7 * 24 * 60 * 60 * 1000, // 7 روز
  MAX_OPTIONS: 10,
  MIN_OPTIONS: 2,
} as const;

// تنظیمات اعلان‌ها
export const NOTIFICATION = {
  TYPES: {
    EVENT_CREATED: 'event_created',
    EVENT_UPDATED: 'event_updated',
    EVENT_CLOSED: 'event_closed',
    BET_PLACED: 'bet_placed',
    BET_WON: 'bet_won',
    BET_LOST: 'bet_lost',
    PAYMENT_RECEIVED: 'payment_received',
    WITHDRAWAL_REQUESTED: 'withdrawal_requested',
    WITHDRAWAL_COMPLETED: 'withdrawal_completed',
  },
  EXPIRY_DAYS: 30,
} as const;

// تنظیمات API
export const API = {
  VERSION: 'v1',
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 دقیقه
    MAX_REQUESTS: 100,
  },
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50,
  },
} as const; 