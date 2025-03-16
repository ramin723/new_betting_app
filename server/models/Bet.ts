import { Model, DataTypes, Sequelize } from 'sequelize';
import { BET_STATUS } from '../constants/constants';
import type { BetAttributes, BetModel, BetStatus } from './types/BetInterface';
import { User } from './user';
import { Event } from './Event';
import { Option } from './Option';

/**
 * مدل Bet
 * مسئول نگهداری اطلاعات شرط‌بندی‌های کاربران
 */
export class Bet extends Model<BetAttributes, BetModel> implements BetModel {
  public id!: number;
  public user_id!: number;
  public event_id!: number;
  public option_id!: number;
  public bet_amount!: number;
  public status!: BetStatus;
  public potential_win_amount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * بررسی امکان برد شرط‌بندی
   */
  public isWinnable(): boolean {
    return this.status === 'ACTIVE';
  }

  /**
   * محاسبه مبلغ برد احتمالی
   */
  public async calculateWinnings(): Promise<number> {
    if (!this.isWinnable()) {
      return 0;
    }

    const event = await this.getEvent();
    const option = await Option.findOne({
      where: {
        event_id: this.event_id,
        id: this.option_id
      }
    });

    if (!event || !option || !event.canAcceptBets()) {
      return 0;
    }

    // محاسبه مبلغ برد بر اساس ضریب گزینه و مبلغ شرط
    const winAmount = this.bet_amount * option.odds;

    // کسر کمیسیون‌ها
    const totalCommission = event.commission_creator + event.commission_referral;
    const finalAmount = winAmount * (1 - totalCommission);

    return Number(finalAmount.toFixed(2));
  }

  /**
   * دریافت کاربر مرتبط با شرط‌بندی
   */
  public async getUser(): Promise<User> {
    return User.findByPk(this.user_id) as Promise<User>;
  }

  /**
   * دریافت رویداد مرتبط با شرط‌بندی
   */
  public async getEvent(): Promise<Event> {
    return Event.findByPk(this.event_id) as Promise<Event>;
  }
}

// تعریف مدل
export const initBet = (sequelize: Sequelize): void => {
  Bet.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id',
        },
      },
      option_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bet_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      status: {
        type: DataTypes.ENUM(...Object.values(BET_STATUS)),
        allowNull: false,
        defaultValue: BET_STATUS.ACTIVE,
      },
      potential_win_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
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
      tableName: 'bets',
      indexes: [
        {
          fields: ['user_id'],
        },
        {
          fields: ['event_id'],
        },
        {
          fields: ['status'],
        },
      ],
      hooks: {
        beforeCreate: async (bet: Bet): Promise<void> => {
          // محاسبه مبلغ برد احتمالی قبل از ذخیره
          bet.potential_win_amount = await bet.calculateWinnings();
        },
        beforeUpdate: async (bet: Bet): Promise<void> => {
          if (bet.changed('bet_amount') || bet.changed('option_id')) {
            bet.potential_win_amount = await bet.calculateWinnings();
          }
        },
      },
    }
  );
};

export default Bet; 