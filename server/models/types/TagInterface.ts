import { Model } from 'sequelize';
import type { EventModel } from './EventInterface';

export interface TagAttributes {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagModel extends Model<TagAttributes>, TagAttributes {
  getEvents(): Promise<EventModel[]>;
}

export type CreateTagInput = Omit<TagAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateTagInput = Partial<CreateTagInput>;

export interface TagResponse extends TagAttributes {
  events?: EventModel[];
} 