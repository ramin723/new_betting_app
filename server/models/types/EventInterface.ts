import { Model } from 'sequelize'
import { EVENT_STATUS, EVENT_TYPES, COMMISSIONS } from '../../constants/constants'
import type { BetModel } from './BetInterface'

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES]
export type EventStatus = typeof EVENT_STATUS[keyof typeof EVENT_STATUS]

export interface EventAttributes {
  id: number
  title: string
  description?: string
  event_type: EventType
  question: string
  result_time: Date
  betting_deadline: Date
  start_time?: Date
  end_time?: Date
  reference_event?: string
  reference_link?: string
  status: EventStatus
  creator_id?: number
  admin_note?: string
  total_pool: number
  commission_creator: number
  commission_referral: number
  platform_commission: number
  is_featured: boolean
  template_id?: number
  createdAt: Date
  updatedAt: Date
}

export interface EventCreationAttributes extends Omit<EventAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  status: EventStatus
  total_pool: number
  commission_creator: number
  commission_referral: number
  platform_commission: number
  is_featured: boolean
}

export interface EventModel extends Model<EventAttributes, EventCreationAttributes>, EventAttributes {
  calculatePotentialWinnings(betAmount: number, optionId: number): Promise<number>
  isActive(): boolean
  canAcceptBets(): boolean
  updateTotalPool(): Promise<void>
  getBets(): Promise<BetModel[]>
  getOptionBets(optionId: number): Promise<BetModel[]>
  calculateCommissions(): Promise<{
    creatorCommission: number
    referralCommission: number
    platformCommission: number
  }>
  calculateReferralBetsAmount(): Promise<number>
}

export interface CreateEventInput {
  title: string
  description?: string
  event_type: EventType
  question: string
  result_time: Date
  betting_deadline: Date
  start_time?: Date
  end_time?: Date
  reference_event?: string
  reference_link?: string
  creator_id?: number
  template_id?: number
}

export interface UpdateEventInput {
  title?: string
  description?: string
  event_type?: EventType
  question?: string
  result_time?: Date
  betting_deadline?: Date
  start_time?: Date
  end_time?: Date
  reference_event?: string
  reference_link?: string
  status?: EventStatus
  admin_note?: string
  is_featured?: boolean
}

export interface EventResponse {
  id: number
  title: string
  description?: string
  event_type: EventType
  question: string
  result_time: Date
  betting_deadline: Date
  start_time?: Date
  end_time?: Date
  reference_event?: string
  reference_link?: string
  status: EventStatus
  creator_id?: number
  total_pool: number
  commission_creator: number
  commission_referral: number
  is_featured: boolean
  template_id?: number
  createdAt: Date
  updatedAt: Date
} 