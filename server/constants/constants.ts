/**
 * مقادیر ثابت سیستم
 */

// کمسیون‌ها
export const COMMISSIONS = {
  CREATOR: 0.03, // 3% کمسیون سازنده رویداد
  REFERRAL: 0.05, // 5% کمسیون دعوت
  PLATFORM_MIN: 0.07, // 7% حداقل کمسیون پلتفرم
  PLATFORM_MAX: 0.12, // 12% حداکثر کمسیون پلتفرم
  TOTAL: 0.15, // 15% مجموع کل کمسیون
} as const;

// وضعیت‌های رویداد
export const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED'
} as const;

// نوع رویدادها
export const EVENT_TYPES = {
  SPORTS: 'SPORTS',
  POLITICS: 'POLITICS',
  ENTERTAINMENT: 'ENTERTAINMENT',
  TECHNOLOGY: 'TECHNOLOGY',
  OTHER: 'OTHER'
} as const;

// وضعیت شرط‌ها
export const BET_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  WIN: 'WIN',
  LOSS: 'LOSS',
  CANCELLED: 'CANCELLED'
} as const;

// نقش‌های کاربری
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
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
  MIN_BET_AMOUNT: 1,
  MAX_BET_AMOUNT: 1000000,
  MIN_WITHDRAWAL: 100,
  MAX_WITHDRAWAL: 1000000,
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

export const WALLET_HISTORY_TYPE = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAW: 'WITHDRAW',
  BET: 'BET',
  WIN: 'WIN',
  COMMISSION: 'COMMISSION',
  REFUND: 'REFUND'
} as const;

export const WALLET_HISTORY_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
} as const;

export const COMMISSION_RATES = {
  CREATOR: 0.05, // 5%
  REFERRAL: 0.02, // 2%
  PLATFORM: 0.03 // 3%
} as const;

export const MIN_BET_AMOUNT = 1;
export const MAX_BET_AMOUNT = 1000000;
export const MIN_WITHDRAW_AMOUNT = 100;
export const MAX_WITHDRAW_AMOUNT = 1000000;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
} as const;

export const CACHE_TTL = {
  SHORT: 60,    // 1 دقیقه
  MEDIUM: 300,  // 5 دقیقه
  LONG: 3600,   // 1 ساعت
  EVENTS: 60,   // 1 دقیقه
  USERS: 300,   // 5 دقیقه
  BETS: 60,     // 1 دقیقه
  WALLET: 300   // 5 دقیقه
} as const; 