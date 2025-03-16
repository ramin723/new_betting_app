import { Model } from 'sequelize'
import type { EventModel } from './EventInterface'

export interface OptionAttributes {
  id: number
  event_id: number
  text: string
  value: string
  odds: number
  total_bets: number
  total_amount: number
  is_winner?: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface OptionModel extends Model<OptionAttributes>, OptionAttributes {
  getEvent(): Promise<EventModel>
}

export interface CreateOptionInput {
  event_id: number
  text: string
  value: string
  odds: number
  order?: number
}

export interface UpdateOptionInput {
  text?: string
  value?: string
  odds?: number
  is_winner?: boolean
  order?: number
}

export interface OptionResponse extends OptionAttributes {
  event?: EventModel
} 