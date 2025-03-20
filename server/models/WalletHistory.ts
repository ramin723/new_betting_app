import { Model, DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '../plugins/sequelize';
import { WALLET_HISTORY_TYPE, WALLET_HISTORY_STATUS } from '../constants/wallet';
import type {
  WalletHistoryAttributes,
  WalletHistoryModel,
  WalletHistoryCreationAttributes,
  WalletHistoryType,
  WalletHistoryStatus
} from './types/WalletHistoryInterface';
import { User } from './User';
import { Event } from './Event';
import { Bet } from './Bet';

/**
 * مدل WalletHistory
 * مسئول نگهداری تاریخچه تراکنش‌های کیف پول
 */
export class WalletHistory extends Model<WalletHistoryAttributes, WalletHistoryCreationAttributes> {
  public id!: number;
  public user_id!: number;
  public amount!: number;
  public type!: WalletHistoryType;
  public status!: WalletHistoryStatus;
  public old_balance!: number;
  public new_balance!: number;
  public wallet_address?: string;
  public description?: string;
  public bet_id?: number;
  public event_id?: number;
  public metadata?: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // متدهای اضافی
  public async getUser(): Promise<User> {
    const user = await User.findByPk(this.user_id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  public async getEvent(): Promise<Event | null> {
    if (!this.event_id) {
      return null;
    }
    return Event.findByPk(this.event_id);
  }

  public async getBet(): Promise<Bet | null> {
    if (!this.bet_id) {
      return null;
    }
    return Bet.findByPk(this.bet_id);
  }
}

// تعریف مدل
export const initWalletHistory = (sequelize: Sequelize): void => {
  WalletHistory.init(
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
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM(...Object.values(WALLET_HISTORY_TYPE)),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM(...Object.values(WALLET_HISTORY_STATUS)),
        allowNull: false,
        defaultValue: WALLET_HISTORY_STATUS.PENDING
      },
      old_balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      new_balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      wallet_address: {
        type: DataTypes.STRING,
        allowNull: true
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      bet_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'bets',
          key: 'id'
        }
      },
      event_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'events',
          key: 'id'
        }
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
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
      tableName: 'wallet_history',
      indexes: [
        {
          fields: ['user_id']
        },
        {
          fields: ['type']
        },
        {
          fields: ['status']
        },
        {
          fields: ['bet_id']
        },
        {
          fields: ['event_id']
        }
      ]
    }
  );
};

export default WalletHistory; 