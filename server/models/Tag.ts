import { Model, DataTypes, Sequelize } from 'sequelize';
import type { TagAttributes, TagModel } from './types/TagInterface';
import type { EventModel } from './types/EventInterface';

export class Tag extends Model<TagAttributes, TagModel> implements TagModel {
  public id!: number;
  public name!: string;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // متدهای مربوط به روابط
  public async getEvents(): Promise<EventModel[]> {
    return (this as any).getEvents();
  }
}

export const initTag = (sequelize: Sequelize): void => {
  Tag.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [2, 50],
        },
      },
      description: {
        type: DataTypes.TEXT,
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
      tableName: 'tags',
      indexes: [
        {
          unique: true,
          fields: ['name'],
        },
      ],
    }
  );
}; 