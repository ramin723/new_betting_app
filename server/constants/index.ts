export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
} as const;

export const SECURITY = {
  TOKEN_EXPIRY: '24h',
  SALT_ROUNDS: 10,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 100,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30
} as const;

export * from './wallet'; 