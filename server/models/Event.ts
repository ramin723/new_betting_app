import { Model, DataTypes, Sequelize } from 'sequelize';
import { EVENT_STATUS, EVENT_TYPES, COMMISSIONS } from '../constants/constants';
import type { EventAttributes, EventModel } from './types/EventInterface';
import type { BetModel } from './types/BetInterface';

export class Event extends Model<EventAttributes, EventModel> implements EventModel {
  public id!: number;
  public title!: string;
  public description?: string;
  public event_type!: typeof EVENT_TYPES[keyof typeof EVENT_TYPES];
  public question!: string;
  public result_time!: Date;
  public betting_deadline!: Date;
  public start_time?: Date;
  public end_time?: Date;
  public reference_event?: string;
  public reference_link?: string;
  public status!: typeof EVENT_STATUS[keyof typeof EVENT_STATUS];
  public creator_id?: number;
  public admin_note?: string;
  public total_pool!: number;
  public commission_creator!: number;
  public commission_referral!: number;
  public is_featured!: boolean;
  public template_id?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // متدهای اضافی مدل
  public async calculatePotentialWinnings(betAmount: number, optionId: number): Promise<number> {
    // محاسبه مقدار احتمالی برد بر اساس نوع رویداد
    const optionBets = await this.getOptionBets(optionId);
    const optionTotal = optionBets.reduce((sum: number, bet: BetModel) => sum + bet.bet_amount, 0);
    
    if (optionTotal === 0) return betAmount;
    
    return (betAmount / optionTotal) * this.total_pool;
  }

  public isActive(): boolean {
    return this.status === EVENT_STATUS.ACTIVE;
  }

  public canAcceptBets(): boolean {
    return this.isActive() && new Date() < this.betting_deadline;
  }

  public async updateTotalPool(): Promise<void> {
    const bets = await this.getBets();
    this.total_pool = bets.reduce((sum: number, bet: BetModel) => sum + bet.bet_amount, 0);
    await this.save();
  }

  // متدهای مربوط به روابط
  public async getBets(): Promise<BetModel[]> {
    // این متد باید در زمان تعریف روابط پیاده‌سازی شود
    return [];
  }

  public async getOptionBets(optionId: number): Promise<BetModel[]> {
    // این متد باید در زمان تعریف روابط پیاده‌سازی شود
    return [];
  }
}

export const initEvent = (sequelize: Sequelize): void => {
  Event.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
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
      event_type: {
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
      result_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      betting_deadline: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      reference_event: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reference_link: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      status: {
        type: DataTypes.ENUM(...Object.values(EVENT_STATUS)),
        allowNull: false,
        defaultValue: EVENT_STATUS.DRAFT,
      },
      creator_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      admin_note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      total_pool: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      commission_creator: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: COMMISSIONS.CREATOR,
        validate: {
          min: 0,
          max: 100,
        },
      },
      commission_referral: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: COMMISSIONS.REFERRAL,
        validate: {
          min: 0,
          max: 100,
        },
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      template_id: {
        type: DataTypes.INTEGER,
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
      tableName: 'events',
      indexes: [
        {
          unique: true,
          fields: ['title'],
        },
        {
          fields: ['creator_id'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['event_type'],
        },
        {
          fields: ['result_time'],
        },
        {
          fields: ['betting_deadline'],
        },
      ],
      hooks: {
        beforeCreate: async (event: Event) => {
          if (!event.commission_creator) {
            event.commission_creator = COMMISSIONS.CREATOR;
          }
          if (!event.commission_referral) {
            event.commission_referral = COMMISSIONS.REFERRAL;
          }
        },
      },
    }
  );
}; 