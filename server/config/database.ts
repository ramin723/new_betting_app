import { Sequelize } from 'sequelize';
import type { Dialect } from 'sequelize';

const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/meem_bet';

export const DB_CONFIG = {
  url: dbUrl,
  options: {
    dialect: 'postgres' as Dialect,
    logging: process.env.NODE_ENV === 'development',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};

export const sequelize = new Sequelize(DB_CONFIG.url, DB_CONFIG.options);

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}; 