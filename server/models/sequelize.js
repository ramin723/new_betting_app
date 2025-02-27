import { sequelize } from './database.js'; 
// تابع برای سینک مدل‌ها
export const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    // سینک تمام مدل‌ها با حفظ داده‌های قبلی
    console.log('⏳ Starting database sync...');
    await sequelize.sync({ force: true }); // `alter: true` بدون حذف داده، تغییرات را اعمال می‌کند
    console.log('✅ Database synced successfully.');
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    throw error;
  }
};

export { sequelize };
