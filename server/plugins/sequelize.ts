import { Sequelize } from 'sequelize'
import { DB_CONFIG } from '../config/database'
import { defineNitroPlugin } from 'nitropack/runtime/plugin'
import { User } from '../models/User'
import { Event } from '../models/Event'
import { Bet } from '../models/Bet'
import { WalletHistory } from '../models/WalletHistory'
import { Notification } from '../models/Notification'

// تنظیمات اتصال به دیتابیس
export const sequelize = new Sequelize(DB_CONFIG.url, DB_CONFIG.options)

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
    
    // تعریف روابط بین مدل‌ها
    User.hasMany(Event, { foreignKey: 'creator_id' })
    Event.belongsTo(User, { foreignKey: 'creator_id' })
    
    User.hasMany(Bet, { foreignKey: 'user_id' })
    Bet.belongsTo(User, { foreignKey: 'user_id' })
    
    Event.hasMany(Bet, { foreignKey: 'event_id' })
    Bet.belongsTo(Event, { foreignKey: 'event_id' })
    
    User.hasMany(WalletHistory, { foreignKey: 'user_id' })
    WalletHistory.belongsTo(User, { foreignKey: 'user_id' })
    
    User.hasMany(Notification, { foreignKey: 'user_id' })
    Notification.belongsTo(User, { foreignKey: 'user_id' })
    
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
export default defineNitroPlugin(async (nitroApp) => {
  try {
    await testConnection()
    await syncModels(false) // همگام‌سازی با حفظ داده‌های موجود
    console.log('✅ Database initialized successfully on server start.')
  } catch (error: unknown) {
    console.error('❌ Failed to initialize database on server start:', error)
    throw error
  }
}) 