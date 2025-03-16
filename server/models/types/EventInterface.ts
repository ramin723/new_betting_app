import { Model } from 'sequelize'
import { EVENT_STATUS, EVENT_TYPES, COMMISSIONS } from '../../constants/constants'
import type { BetModel } from './BetInterface'

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES]
export type EventStatus = typeof EVENT_STATUS[keyof typeof EVENT_STATUS]

export interface EventAttributes {
  id: number
  title: string
  description?: string
  event_type: typeof EVENT_TYPES[keyof typeof EVENT_TYPES]
  question: string
  result_time: Date
  betting_deadline: Date
  start_time?: Date
  end_time?: Date
  reference_event?: string
  reference_link?: string
  status: typeof EVENT_STATUS[keyof typeof EVENT_STATUS]
  creator_id?: number
  admin_note?: string
  total_pool: number
  commission_creator: number
  commission_referral: number
  is_featured: boolean
  template_id?: number
  createdAt: Date
  updatedAt: Date
}

export interface EventModel extends Model<EventAttributes>, EventAttributes {
  calculatePotentialWinnings(betAmount: number, optionId: number): Promise<number>
  isActive(): boolean
  canAcceptBets(): boolean
  updateTotalPool(): Promise<void>
  getBets(): Promise<BetModel[]>
  getOptionBets(optionId: number): Promise<BetModel[]>
}

export interface CreateEventInput {
  title: string
  description?: string
  event_type: typeof EVENT_TYPES[keyof typeof EVENT_TYPES]
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
  event_type?: typeof EVENT_TYPES[keyof typeof EVENT_TYPES]
  question?: string
  result_time?: Date
  betting_deadline?: Date
  start_time?: Date
  end_time?: Date
  reference_event?: string
  reference_link?: string
  status?: typeof EVENT_STATUS[keyof typeof EVENT_STATUS]
  admin_note?: string
  is_featured?: boolean
}

export interface EventResponse {
  id: number
  title: string
  description?: string
  event_type: typeof EVENT_TYPES[keyof typeof EVENT_TYPES]
  question: string
  result_time: Date
  betting_deadline: Date
  start_time?: Date
  end_time?: Date
  reference_event?: string
  reference_link?: string
  status: typeof EVENT_STATUS[keyof typeof EVENT_STATUS]
  creator_id?: number
  total_pool: number
  commission_creator: number
  commission_referral: number
  is_featured: boolean
  template_id?: number
  createdAt: Date
  updatedAt: Date
} 