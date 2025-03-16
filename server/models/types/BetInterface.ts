import { Model } from 'sequelize'
import { BET_STATUS } from '../../constants/constants'
import type { UserModel } from './UserInterface'
import type { EventModel } from './EventInterface'

export type BetStatus = keyof typeof BET_STATUS

export interface BetAttributes {
  id: number
  user_id: number
  event_id: number
  option_id: number
  bet_amount: number
  status: BetStatus
  potential_win_amount: number
  createdAt: Date
  updatedAt: Date
}

export interface BetModel extends Model<BetAttributes>, BetAttributes {
  getUser(): Promise<UserModel>
  getEvent(): Promise<EventModel>
  isWinnable(): boolean
  calculateWinnings(): Promise<number>
}

// تعریف نوع برای داده‌های ورودی
export interface CreateBetInput {
  user_id: number
  event_id: number
  option_id: number
  bet_amount: number
}

// تعریف نوع برای داده‌های به‌روزرسانی
export interface UpdateBetInput {
  status?: BetStatus
  potential_win_amount?: number
}

// تعریف نوع برای پاسخ API
export interface BetResponse extends BetAttributes {
  user?: UserModel
  event?: EventModel
} 