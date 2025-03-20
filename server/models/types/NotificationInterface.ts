import { Model } from 'sequelize';

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface NotificationAttributes {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationCreationAttributes extends Omit<NotificationAttributes, 'id' | 'is_read' | 'created_at' | 'updated_at'> {
  is_read?: boolean;
}

export interface NotificationModel extends Model<NotificationAttributes, NotificationCreationAttributes>, NotificationAttributes {
  markAsRead(): Promise<void>;
}

export type CreateNotificationInput = NotificationCreationAttributes;

export type UpdateNotificationInput = Partial<Omit<NotificationAttributes, 'id' | 'created_at' | 'updated_at'>>; 