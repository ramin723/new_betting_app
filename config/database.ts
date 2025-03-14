import { Sequelize } from 'sequelize'
import path from 'path'

// تنظیمات اتصال به دیتابیس SQLite
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(process.cwd(), 'database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false
})

// تست اتصال به دیتابیس
export async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('Connection to database has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

// همگام‌سازی مدل‌ها با دیتابیس
export async function syncDatabase() {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
    console.log('Database synchronized successfully.')
  } catch (error) {
    console.error('Error synchronizing database:', error)
  }
} 