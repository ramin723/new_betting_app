import { Model } from 'sequelize'
import { USER_ROLES } from '../../constants/constants'

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

/**
 * ویژگی‌های اصلی مدل User
 */
export interface UserAttributes {
  id: number
  username: string
  telegram_id?: string
  email?: string
  first_name?: string
  last_name?: string
  password: string
  balance: number
  wallet_address?: string
  isBlocked: boolean
  total_referral_earnings: number
  role: UserRole
  avatar?: string
  commission?: number
  points?: number
  createdAt: Date
  updatedAt: Date
}

/**
 * متدهای اضافی مدل User
 */
export interface UserModel extends Model<UserAttributes>, UserAttributes {
  // متدهای اضافی مدل می‌توانند اینجا تعریف شوند
  comparePassword(password: string): Promise<boolean>
  generateToken(): string
}

/**
 * داده‌های مورد نیاز برای ایجاد کاربر جدید
 */
export interface CreateUserInput {
  username: string
  telegram_id?: string
  email?: string
  first_name?: string
  last_name?: string
  password: string
  wallet_address?: string
  role?: UserRole
}

/**
 * داده‌های قابل به‌روزرسانی کاربر
 */
export interface UpdateUserInput {
  username?: string
  telegram_id?: string
  email?: string
  first_name?: string
  last_name?: string
  password?: string
  balance?: number
  wallet_address?: string
  isBlocked?: boolean
  total_referral_earnings?: number
  role?: UserRole
}

/**
 * پاسخ API برای کاربر
 */
export interface UserResponse {
  id: number
  username: string
  telegram_id?: string
  email?: string
  first_name?: string
  last_name?: string
  balance: number
  wallet_address?: string
  isBlocked: boolean
  total_referral_earnings: number
  role: UserRole
  createdAt: Date
  updatedAt: Date
} 