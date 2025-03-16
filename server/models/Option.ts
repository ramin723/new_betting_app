import { Model, DataTypes, Sequelize } from 'sequelize'
import type { OptionAttributes, OptionModel } from './types/OptionInterface'
import { Event } from './Event'

/**
 * مدل Option
 * مسئول نگهداری اطلاعات گزینه‌های شرط‌بندی
 */
export class Option extends Model<OptionAttributes, OptionModel> implements OptionModel {
  public id!: number
  public event_id!: number
  public text!: string
  public value!: string
  public odds!: number
  public total_bets!: number
  public total_amount!: number
  public is_winner?: boolean
  public order!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  /**
   * دریافت رویداد مرتبط با گزینه
   */
  public async getEvent(): Promise<Event> {
    return Event.findByPk(this.event_id) as Promise<Event>
  }
}

// تعریف مدل
export const initOption = (sequelize: Sequelize): void => {
  Option.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        }
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 100]
        }
      },
      value: {
        type: DataTypes.STRING,
        allowNull: false
      },
      odds: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1
        }
      },
      total_bets: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      is_winner: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      tableName: 'options',
      indexes: [
        {
          fields: ['event_id']
        },
        {
          fields: ['is_winner']
        }
      ],
      hooks: {
        beforeCreate: async (option: Option): Promise<void> => {
          // اطمینان از اینکه odds حداقل 1 است
          if (option.odds < 1) {
            option.odds = 1
          }
        }
      }
    }
  )
}

export default Option 