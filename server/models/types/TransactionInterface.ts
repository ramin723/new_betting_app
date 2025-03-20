import { Model } from 'sequelize';
import type { Optional } from 'sequelize';

// نوع وضعیت تراکنش
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

// ویژگی‌های اصلی تراکنش
export interface TransactionAttributes {
  id: number;
  wallet_history_id: number;
  tx_hash: string;
  block_number?: bigint;
  confirmation_count: number;
  ton_amount: number;
  usd_amount?: number;
  sender_address: string;
  receiver_address: string;
  status: TransactionStatus;
  raw_data?: any;
  error_message?: string;
  created_at?: Date;
  updated_at?: Date;
}

// ویژگی‌های اختیاری در زمان ایجاد
export interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'confirmation_count' | 'status'> {}

// مدل تراکنش با متدهای اضافی
export interface TransactionModel extends Model<TransactionAttributes, TransactionCreationAttributes>, TransactionAttributes {
  // متدهای اضافی اینجا اضافه می‌شوند
  getWalletHistory(): Promise<any>; // نوع دقیق WalletHistory بعداً اضافه می‌شود
}

// نوع برای استفاده در API
export interface TransactionResponse {
  id: number;
  tx_hash: string;
  status: TransactionStatus;
  amount: {
    ton: number;
    usd?: number;
  };
  addresses: {
    from: string;
    to: string;
  };
  confirmations: number;
  timestamp: Date;
} 