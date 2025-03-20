import { Model } from 'sequelize';
import { EVENT_TYPES } from '../../constants/constants';
import type { EventModel } from './EventInterface';

export interface EventTemplateAttributes {
  id: number;
  name: string;
  description?: string;
  type: keyof typeof EVENT_TYPES;
  question: string;
  options: Array<{
    text: string;
    value: string;
    odds?: number;
  }>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventTemplateModel extends Model<EventTemplateAttributes>, EventTemplateAttributes {
  getEvents(): Promise<EventModel[]>;
}

export type CreateEventTemplateInput = Omit<EventTemplateAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateEventTemplateInput = Partial<CreateEventTemplateInput>;

export interface EventTemplateResponse extends EventTemplateAttributes {
  events?: EventModel[];
} 