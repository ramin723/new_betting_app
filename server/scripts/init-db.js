import { sequelize } from '../models/database.js';

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    console.log('⏳ Creating database tables...');
    
    // ایجاد تمام جدول‌ها از ابتدا
    await sequelize.sync({ 
      force: true, // حذف و ایجاد مجدد تمام جدول‌ها
      logging: false
    });
    
    console.log('✅ Database tables created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase(); 