import { useRuntimeConfig } from '#imports';

const config = useRuntimeConfig();

export const JWT_CONFIG = {
  secret: config.jwtSecret,
  expiresIn: '24h',
  refreshTokenExpiresIn: '7d',
  algorithm: 'HS256'
}; 