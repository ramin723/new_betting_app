import { Model } from 'sequelize'

export interface UserAttributes {
  id?: number;
  username: string;
  telegram_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  password: string;
  balance: number;
  wallet_address?: string;
  isBlocked: boolean;
  total_referral_earnings: number;
  role: 'admin' | 'user';
  avatar?: string;
  commission?: number;
  points?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserModel extends Model<UserAttributes>, UserAttributes {}

export interface EventAttributes {
  id?: number;
  title: string;
  description: string;
  creator_id: number;
  event_type: 'yes_no' | 'winner' | 'custom';
  question: string;
  result_time: Date;
  betting_deadline: Date;
  start_time: Date;
  end_time?: Date;
  reference_event?: string;
  reference_link?: string;
  status: 'active' | 'finished' | 'cancelled';
  admin_note?: string;
  total_pool?: number;
  commission_creator: number;
  commission_referral: number;
  is_featured?: boolean;
  template_id?: number;
  created_at?: Date;
  updated_at?: Date;
  participants_count: number;
  total_bets: number;
}

export interface EventModel extends Model<EventAttributes>, EventAttributes {}

export interface BetAttributes {
  id?: number;
  user_id: number;
  event_id: number;
  bet_amount: number;
  option_id: number;
  status: 'active' | 'won' | 'lost';
  potential_win_amount: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface BetModel extends Model<BetAttributes>, BetAttributes {}

export interface WalletHistoryAttributes {
  id?: number;
  user_id: number;
  amount: number;
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | 'commission' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  old_balance: number;
  new_balance: number;
  wallet_address?: string;
  description?: string;
  event_id?: number;
  bet_id?: number;
  metadata?: any;
  created_at?: Date;
  updated_at?: Date;
}

export interface WalletHistoryModel extends Model<WalletHistoryAttributes>, WalletHistoryAttributes {}

export interface EventReferralAttributes {
  id?: number;
  event_id: number;
  referrer_id: number;
  referred_id: number;
  created_at?: Date;
  updated_at?: Date;
  referred_count: number;
  total_commission: number;
}

export interface EventReferralModel extends Model<EventReferralAttributes>, EventReferralAttributes {}

export interface OptionAttributes {
  id?: number;
  event_id: number;
  text: string;
  value: string;
  odds: number;
  total_bets?: number;
  total_amount?: number;
  is_winner?: boolean;
  order?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface OptionModel extends Model<OptionAttributes>, OptionAttributes {}

export interface TagAttributes {
  id?: number;
  name: string;
  parent_id: number | null;
  status: string;
  created_at?: Date;
  updated_at?: Date;
  children?: TagAttributes[];
}

export interface TagModel extends Model<TagAttributes>, TagAttributes {} 