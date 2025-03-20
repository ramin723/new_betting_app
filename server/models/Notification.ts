import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import type { NotificationAttributes, NotificationModel, NotificationCreationAttributes, NotificationType } from './types/NotificationInterface';

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationModel {
  public id!: number;
  public user_id!: number;
  public title!: string;
  public message!: string;
  public type!: NotificationType;
  public is_read!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  public async markAsRead(): Promise<void> {
    this.is_read = true;
    await this.save();
  }
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR'),
      allowNull: false,
      defaultValue: 'INFO'
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
); 