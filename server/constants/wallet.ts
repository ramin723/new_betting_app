/**
 * ثابت‌های مربوط به کیف پول
 */

// انواع تراکنش‌های کیف پول
export const WALLET_HISTORY_TYPE = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAW: 'WITHDRAW',
  BET: 'BET',
  WIN: 'WIN',
  COMMISSION: 'COMMISSION',
  REFUND: 'REFUND',
} as const;

// وضعیت‌های تراکنش‌های کیف پول
export const WALLET_HISTORY_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

// محدودیت‌های کیف پول
export const WALLET_LIMITS = {
  MIN_BET: 0.1,
  MAX_BET: 1000,
  MIN_WITHDRAWAL: 10,
  MAX_WITHDRAWAL: 10000,
} as const;

export type WalletHistoryType = keyof typeof WALLET_HISTORY_TYPE;
export type WalletHistoryStatus = keyof typeof WALLET_HISTORY_STATUS; 