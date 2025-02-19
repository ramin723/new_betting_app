import { Sequelize } from 'sequelize';
import { User } from './database'; // مدل User یا مدل‌های دیگر

// اتصال به دیتابیس SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // فایل دیتابیس
  logging: false, // حذف لاگ‌های اضافی
});

// تابع برای سینک مدل‌ها
export const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // سینک تمام مدل‌ها
    await sequelize.sync({ force: false }); // تغییر به true برای پاک‌سازی دیتابیس در توسعه
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Error syncing database:', error);
    throw error;
  }
};

export { sequelize };
