export const AUTH_CONSTANTS = {
  DEFAULT_JWT_SECRET: 'meem-bet-jwt-secret-2024',
  DEFAULT_COOKIE_NAME: 'auth_token',
  TOKEN_EXPIRY: '24h',
  COOKIE_MAX_AGE: 60 * 60 * 24 // 24 hours
} as const; 