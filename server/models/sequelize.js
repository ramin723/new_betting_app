import { sequelize } from './database.js'; 
// تابع برای سینک مدل‌ها
export const syncDatabase = async () => {
  try {
    console.log('⏳ Attempting to connect to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    // سینک تمام مدل‌ها با حفظ داده‌های قبلی
    console.log('⏳ Starting database sync...');
    
    // همگام‌سازی ساده
    console.log('⏳ Syncing with options:', { force: false, alter: false });
    await sequelize.sync({ 
      force: false, // حفظ داده‌های موجود
      alter: false, // بدون تغییر ساختار
      logging: (msg) => console.log('📝 Sequelize:', msg)
    });
    
    console.log('✅ Database synced successfully.');
  } catch (error) {
    console.error('❌ Error syncing database:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
};

export { sequelize };
