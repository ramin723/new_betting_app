import { Model } from 'sequelize'
import { USER_ROLES } from '../../constants/constants'

export type UserRole = keyof typeof USER_ROLES

/**
 * ویژگی‌های اصلی مدل User
 */
export interface UserAttributes {
  id: number
  username: string
  first_name?: string
  last_name?: string
  email?: string
  password: string
  role: UserRole
  balance: number
  avatar?: string
  commission?: number
  points?: number
  wallet_address?: string
  telegram_id?: string
  referral_user?: number
  total_referral_earnings: number
  isBlocked: boolean
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
  first_name?: string
  last_name?: string
  email?: string
  password: string
  role?: UserRole
  avatar?: string
  commission?: number
  points?: number
  wallet_address?: string
  telegram_id?: string
  referral_user?: number
}

/**
 * داده‌های قابل به‌روزرسانی کاربر
 */
export interface UpdateUserInput {
  first_name?: string
  last_name?: string
  email?: string
  password?: string
  role?: UserRole
  balance?: number
  avatar?: string
  commission?: number
  points?: number
  wallet_address?: string
  telegram_id?: string
  referral_user?: number
  total_referral_earnings?: number
  isBlocked?: boolean
}

/**
 * پاسخ API برای کاربر
 */
export interface UserResponse extends Omit<UserAttributes, 'password'> {
  events?: any[]
  bets?: any[]
  wallet_history?: any[]
} 