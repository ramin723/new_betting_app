import { Model } from 'sequelize';
import type { Optional } from 'sequelize';
import { WALLET_HISTORY_TYPE, WALLET_HISTORY_STATUS } from '../../constants/wallet';
import type { UserModel } from './UserInterface';
import type { EventModel } from './EventInterface';
import type { BetModel } from './BetInterface';

export type WalletHistoryType = keyof typeof WALLET_HISTORY_TYPE;
export type WalletHistoryStatus = keyof typeof WALLET_HISTORY_STATUS;

// تعریف ویژگی‌های اصلی مدل
export interface WalletHistoryAttributes {
  id: number;
  user_id: number;
  amount: number;
  type: WalletHistoryType;
  status: WalletHistoryStatus;
  old_balance: number;
  new_balance: number;
  wallet_address?: string;
  description?: string;
  bet_id?: number;
  event_id?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// تعریف ویژگی‌های مورد نیاز برای ایجاد رکورد جدید
export type WalletHistoryCreationAttributes = Optional<WalletHistoryAttributes, 'id' | 'createdAt' | 'updatedAt'>;

// تعریف ویژگی‌های مورد نیاز برای به‌روزرسانی رکورد
export interface UpdateWalletHistoryInput {
  status?: WalletHistoryStatus;
  new_balance?: number;
  metadata?: Record<string, any>;
}

// تعریف مدل با متدهای اضافی
export interface WalletHistoryModel extends Model<WalletHistoryAttributes, WalletHistoryCreationAttributes>, WalletHistoryAttributes {
  getUser(): Promise<UserModel>;
  getEvent(): Promise<EventModel | null>;
  getBet(): Promise<BetModel | null>;
}

// تعریف نوع برای پاسخ API
export interface WalletHistoryResponse extends WalletHistoryAttributes {
  user?: UserModel;
  event?: EventModel;
  bet?: BetModel;
} 