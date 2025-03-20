import { Model, DataTypes, Sequelize } from 'sequelize';
import { EVENT_TYPES } from '../constants/constants';
import type { EventTemplateAttributes, EventTemplateModel } from './types/EventTemplateInterface';
import type { EventModel } from './types/EventInterface';

export class EventTemplate extends Model<EventTemplateAttributes, EventTemplateModel> implements EventTemplateModel {
  public id!: number;
  public name!: string;
  public description?: string;
  public type!: keyof typeof EVENT_TYPES;
  public question!: string;
  public options!: Array<{
    text: string;
    value: string;
    odds?: number;
  }>;
  public metadata?: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // متدهای مربوط به روابط
  public async getEvents(): Promise<EventModel[]> {
    return (this as any).getEvents();
  }
}

export const initEventTemplate = (sequelize: Sequelize): void => {
  EventTemplate.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [3, 100],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM(...Object.values(EVENT_TYPES)),
        allowNull: false,
      },
      question: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [3, 200],
        },
      },
      options: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          isValidOptions(value: Array<{text: string; value: string; odds?: number}>) {
            if (!Array.isArray(value) || value.length < 2) {
              throw new Error('حداقل دو گزینه باید وجود داشته باشد');
            }
            value.forEach(option => {
              if (!option.text || !option.value) {
                throw new Error('هر گزینه باید متن و مقدار داشته باشد');
              }
              if (option.odds !== undefined && (option.odds <= 0 || option.odds > 100)) {
                throw new Error('ضریب باید بین 0 و 100 باشد');
              }
            });
          }
        }
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'event_templates',
      indexes: [
        {
          fields: ['type'],
        },
      ],
    }
  );
}; 