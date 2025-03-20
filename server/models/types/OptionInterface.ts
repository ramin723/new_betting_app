import { Model } from 'sequelize'
import type { EventModel } from './EventInterface'
import type { BetModel } from './BetInterface'

export interface OptionAttributes {
  id: number
  event_id: number
  text: string
  value: string
  odds: number
  total_bets: number
  total_amount: number
  is_winner: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface OptionModel extends Model<OptionAttributes>, OptionAttributes {
  getEvent(): Promise<EventModel>
  getBets(): Promise<BetModel[]>
}

export type CreateOptionInput = Omit<OptionAttributes, 'id' | 'total_bets' | 'total_amount' | 'is_winner' | 'createdAt' | 'updatedAt'>
export type UpdateOptionInput = Partial<CreateOptionInput>

export interface OptionResponse extends Omit<OptionAttributes, 'event_id'> {
  event?: EventModel
  bets?: BetModel[]
} 