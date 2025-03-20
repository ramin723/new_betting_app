import { DataTypes, Sequelize } from 'sequelize';
import type { TransactionModel, TransactionAttributes, TransactionCreationAttributes } from './types/TransactionInterface';
import { sequelize } from '../plugins/sequelize';

const Transaction = sequelize.define<TransactionModel, TransactionAttributes>(
  'Transaction',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    wallet_history_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'WalletHistory',
        key: 'id'
      }
    },
    tx_hash: {
      type: DataTypes.STRING(66), // برای هش‌های TON
      allowNull: false,
      unique: true,
      validate: {
        is: /^[0-9a-fA-F]{64,66}$/ // اعتبارسنجی فرمت هش تراکنش
      }
    },
    block_number: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    confirmation_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    ton_amount: {
      type: DataTypes.DECIMAL(24, 9), // برای مقادیر TON با 9 رقم اعشار
      allowNull: false,
      validate: {
        min: 0
      }
    },
    usd_amount: {
      type: DataTypes.DECIMAL(12, 2), // مقدار معادل به دلار
      allowNull: true,
      validate: {
        min: 0
      }
    },
    sender_address: {
      type: DataTypes.STRING(48), // آدرس کیف پول TON فرستنده
      allowNull: false,
      validate: {
        is: /^[0-9a-zA-Z-_]{48}$/ // اعتبارسنجی فرمت آدرس TON
      }
    },
    receiver_address: {
      type: DataTypes.STRING(48), // آدرس کیف پول TON گیرنده
      allowNull: false,
      validate: {
        is: /^[0-9a-zA-Z-_]{48}$/ // اعتبارسنجی فرمت آدرس TON
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'failed'),
      defaultValue: 'pending'
    },
    raw_data: {
      type: DataTypes.JSON, // داده‌های خام تراکنش از بلاکچین
      allowNull: true
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['tx_hash']
      },
      {
        fields: ['wallet_history_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['block_number']
      }
    ]
  }
);

// تعریف روابط
export const initTransactionAssociations = (models: any) => {
  Transaction.belongsTo(models.WalletHistory, {
    foreignKey: 'wallet_history_id',
    as: 'wallet_history'
  });
};

export default Transaction; 