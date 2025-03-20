import { sequelize } from './database';
import { redis } from './redis';
import { JWT_CONFIG } from './jwt';

export const config = {
  database: sequelize,
  redis,
  jwt: JWT_CONFIG,
  app: {
    name: 'Betting App',
    version: '1.0.0',
    description: 'A modern betting application',
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  }
}; 