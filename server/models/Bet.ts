import { Model, DataTypes, Sequelize } from 'sequelize';
import { BET_STATUS, COMMISSIONS } from '../constants/constants';
import type { BetAttributes, BetModel, BetCreationAttributes, BetStatus } from './types/BetInterface';
import type { WalletHistoryType, WalletHistoryStatus, CreateWalletHistoryInput } from './types/WalletHistoryInterface';
import { User } from './User';
import { Event } from './Event';
import { Option } from './Option';
import { WalletHistory } from './WalletHistory';
import { WALLET_HISTORY_TYPE, WALLET_HISTORY_STATUS } from '../constants/wallet';

/**
 * مدل Bet
 * مسئول نگهداری اطلاعات شرط‌بندی‌های کاربران
 */
export class Bet extends Model<BetAttributes, BetCreationAttributes> implements BetModel {
  public id!: number;
  public user_id!: number;
  public event_id!: number;
  public option_id!: number;
  public bet_amount!: number;
  public status!: BetStatus;
  public potential_win_amount!: number;
  public referral_id?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * بررسی امکان برد شرط‌بندی
   */
  public isWinnable(): boolean {
    return this.status === BET_STATUS.ACTIVE;
  }

  /**
   * محاسبه مبلغ برد احتمالی
   * @returns مبلغ برد پس از کسر کمیسیون‌ها
   */
  public async calculateWinnings(): Promise<number> {
    try {
      // بررسی وضعیت شرط
      if (!this.isWinnable()) {
        return 0;
      }

      // دریافت اطلاعات رویداد و گزینه
      const [event, option] = await Promise.all([
        this.getEvent(),
        Option.findOne({
          where: { event_id: this.event_id, id: this.option_id }
        })
      ]);

      // بررسی وجود رویداد و گزینه
      if (!event || !option) {
        throw new Error('رویداد یا گزینه یافت نشد');
      }

      // بررسی وضعیت رویداد
      if (!event.canAcceptBets()) {
        return 0;
      }

      // محاسبه مبلغ برد ناخالص
      const grossWinAmount = this.bet_amount * option.odds;

      // محاسبه کمیسیون‌ها
      const creatorCommission = grossWinAmount * event.commission_creator;
      const referralCommission = grossWinAmount * event.commission_referral;
      const platformCommission = grossWinAmount * event.platform_commission;
      const totalCommissions = creatorCommission + referralCommission + platformCommission;

      // محاسبه مبلغ نهایی
      const netWinAmount = grossWinAmount - totalCommissions;

      // گرد کردن به دو رقم اعشار
      return Number(Math.floor(netWinAmount * 100) / 100);

    } catch (error) {
      console.error('خطا در محاسبه مبلغ برد:', error);
      return 0;
    }
  }

  /**
   * محاسبه و پرداخت کمیسیون‌ها
   * @param winAmount مبلغ برد ناخالص
   */
  public async payCommissions(winAmount: number): Promise<void> {
    try {
      const event = await this.getEvent();
      if (!event) return;

      const creatorCommission = winAmount * Number(event.commission_creator || 0);
      const referralCommission = winAmount * Number(event.commission_referral || 0);
      const platformCommission = winAmount * Number(event.platform_commission || COMMISSIONS.PLATFORM_MIN);

      // پرداخت کمیسیون به سازنده رویداد
      if (creatorCommission > 0 && event.creator_id) {
        const creator = await User.findByPk(event.creator_id);
        if (creator) {
          const oldBalance = Number(creator.balance || 0);
          const newBalance = oldBalance + creatorCommission;

          const creatorWalletHistory: CreateWalletHistoryInput = {
            user_id: event.creator_id,
            amount: creatorCommission,
            type: WALLET_HISTORY_TYPE.COMMISSION,
            status: WALLET_HISTORY_STATUS.COMPLETED,
            old_balance: oldBalance,
            new_balance: newBalance,
            event_id: this.event_id,
            bet_id: this.id,
            metadata: { commission_type: 'creator' }
          };

          await WalletHistory.create(creatorWalletHistory);
          await creator.update({ balance: newBalance });
        }
      }

      // پرداخت کمیسیون به معرف
      if (this.referral_id && referralCommission > 0) {
        const referrer = await User.findByPk(this.referral_id);
        if (referrer) {
          const oldBalance = Number(referrer.balance || 0);
          const newBalance = oldBalance + referralCommission;

          const referralWalletHistory: CreateWalletHistoryInput = {
            user_id: this.referral_id,
            amount: referralCommission,
            type: WALLET_HISTORY_TYPE.COMMISSION,
            status: WALLET_HISTORY_STATUS.COMPLETED,
            old_balance: oldBalance,
            new_balance: newBalance,
            event_id: this.event_id,
            bet_id: this.id,
            metadata: { commission_type: 'referral' }
          };

          await WalletHistory.create(referralWalletHistory);
          await referrer.update({ balance: newBalance });
        }
      }

      // ثبت کمیسیون پلتفرم
      if (platformCommission > 0) {
        const platformWalletHistory: CreateWalletHistoryInput = {
          user_id: 0, // حساب سیستم
          amount: platformCommission,
          type: WALLET_HISTORY_TYPE.COMMISSION,
          status: WALLET_HISTORY_STATUS.COMPLETED,
          old_balance: 0,
          new_balance: 0,
          event_id: this.event_id,
          bet_id: this.id,
          metadata: { commission_type: 'platform' }
        };

        await WalletHistory.create(platformWalletHistory);
      }
    } catch (error) {
      console.error('خطا در پرداخت کمیسیون‌ها:', error);
      throw error;
    }
  }

  /**
   * دریافت کاربر مرتبط با شرط‌بندی
   */
  public async getUser(): Promise<User> {
    const user = await User.findByPk(this.user_id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * دریافت رویداد مرتبط با شرط‌بندی
   */
  public async getEvent(): Promise<Event> {
    const event = await Event.findByPk(this.event_id);
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  }
}

// تعریف مدل
export const initBet = (sequelize: Sequelize): void => {
  Bet.init(
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
      event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        }
      },
      option_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      bet_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01
        }
      },
      status: {
        type: DataTypes.ENUM(...Object.values(BET_STATUS)),
        allowNull: false,
        defaultValue: BET_STATUS.ACTIVE
      },
      potential_win_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      referral_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
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
      tableName: 'bets',
      indexes: [
        {
          fields: ['user_id']
        },
        {
          fields: ['event_id']
        },
        {
          fields: ['option_id']
        },
        {
          fields: ['status']
        },
        {
          fields: ['referral_id']
        }
      ]
    }
  );
};

export default Bet; 