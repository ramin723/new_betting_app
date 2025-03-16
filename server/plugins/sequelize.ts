import { Sequelize } from 'sequelize'
import { DB_CONFIG } from '../config/database'
import { defineNuxtPlugin } from '#imports'

// تنظیمات اتصال به دیتابیس
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_CONFIG.storage,
  logging: (msg) => console.log('📝 Sequelize:', msg),
  define: {
    underscored: true,
    timestamps: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

// تست اتصال به دیتابیس
export const testConnection = async (): Promise<void> => {
  try {
    console.log('⏳ Attempting to connect to database...')
    await sequelize.authenticate()
    console.log('✅ Database connected successfully.')
  } catch (error: unknown) {
    console.error('❌ Error connecting to database:', error)
    throw error
  }
}

// همگام‌سازی مدل‌ها با پایگاه داده
export const syncModels = async (force: boolean = false): Promise<void> => {
  try {
    console.log('⏳ Starting database sync...')
    console.log('⏳ Syncing with options:', { force, alter: false })
    
    await sequelize.sync({ 
      force, // اگر true باشد، جداول را حذف و دوباره می‌سازد
      alter: false, // از تغییر ساختار جلوگیری می‌کند
      logging: (msg) => console.log('📝 Sequelize:', msg)
    })
    
    console.log('✅ Database synced successfully.')
  } catch (error: unknown) {
    console.error('❌ Error syncing database:', error)
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack)
    }
    throw error
  }
}

// Nitro Plugin برای همگام‌سازی در شروع سرور
export default defineNuxtPlugin(async () => {
  try {
    await testConnection()
    await syncModels(false) // همگام‌سازی با حفظ داده‌های موجود
    console.log('✅ Database initialized successfully on server start.')
  } catch (error: unknown) {
    console.error('❌ Failed to initialize database on server start:', error)
    throw error
  }
}) 