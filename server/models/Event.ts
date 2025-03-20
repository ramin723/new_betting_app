import { Model, DataTypes, Sequelize, Op } from 'sequelize';
import { EVENT_STATUS, EVENT_TYPES, COMMISSIONS } from '../constants/constants';
import type { EventAttributes, EventModel } from './types/EventInterface';
import type { BetModel } from './types/BetInterface';
import { User } from './User';
import { Bet } from './Bet';
import { Option } from './Option';

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
  public platform_commission!: number;
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

  /**
   * محاسبه کمیسیون‌های رویداد
   * @returns آبجکت حاوی مقادیر کمیسیون‌ها
   */
  public async calculateCommissions(): Promise<{
    creatorCommission: number;
    referralCommission: number;
    platformCommission: number;
  }> {
    try {
      // دریافت تمام شرط‌های رویداد
      const bets = await this.getBets();
      
      // محاسبه کل استخر
      const totalPool = bets.reduce((sum, bet) => sum + bet.bet_amount, 0);
      
      // محاسبه کمیسیون سازنده (3% از کل استخر)
      const creatorCommission = totalPool * COMMISSIONS.CREATOR;
      
      // محاسبه مجموع شرط‌های کاربران دعوت شده
      const referralBetsAmount = await this.calculateReferralBetsAmount();
      
      // محاسبه کمیسیون معرف‌ها (5% از مجموع شرط‌های کاربران دعوت شده)
      const referralCommission = referralBetsAmount * COMMISSIONS.REFERRAL;
      
      // محاسبه کمیسیون پلتفرم (باقیمانده تا 15%)
      const platformCommission = (totalPool * COMMISSIONS.TOTAL) - (creatorCommission + referralCommission);
      
      return {
        creatorCommission,
        referralCommission,
        platformCommission
      };
    } catch (error) {
      console.error('خطا در محاسبه کمیسیون‌ها:', error);
      throw error;
    }
  }

  /**
   * محاسبه مجموع شرط‌های کاربران دعوت شده
   * @returns مجموع مبالغ شرط‌های کاربران دعوت شده
   */
  public async calculateReferralBetsAmount(): Promise<number> {
    try {
      const bets = await Bet.findAll({
        where: { event_id: this.id },
        include: [{
          model: User,
          where: {
            referral_user: { [Op.not]: null }
          }
        }]
      });
      
      return bets.reduce((sum, bet) => sum + bet.bet_amount, 0);
    } catch (error) {
      console.error('خطا در محاسبه مجموع شرط‌های کاربران دعوت شده:', error);
      return 0;
    }
  }

  /**
   * به‌روزرسانی کل استخر و کمیسیون‌ها
   */
  public async updateTotalPool(): Promise<void> {
    try {
      const bets = await this.getBets();
      const totalPool = bets.reduce((sum, bet) => sum + bet.bet_amount, 0);
      
      const commissions = await this.calculateCommissions();
      
      await this.update({
        total_pool: totalPool,
        commission_creator: commissions.creatorCommission,
        commission_referral: commissions.referralCommission,
        platform_commission: commissions.platformCommission
      });
    } catch (error) {
      console.error('خطا در به‌روزرسانی استخر:', error);
      throw error;
    }
  }

  // متدهای مربوط به روابط
  /**
   * دریافت تمام شرط‌های رویداد
   */
  public async getBets(): Promise<BetModel[]> {
    return Bet.findAll({
      where: { event_id: this.id }
    });
  }

  /**
   * دریافت شرط‌های یک گزینه خاص
   */
  public async getOptionBets(optionId: number): Promise<BetModel[]> {
    return Bet.findAll({
      where: {
        event_id: this.id,
        option_id: optionId
      }
    });
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
      platform_commission: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: COMMISSIONS.PLATFORM_MIN,
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
          if (!event.platform_commission) {
            event.platform_commission = COMMISSIONS.PLATFORM_MIN;
          }
        },
      },
    }
  );
}; 