import { Tag, User, Event, Option, Bet, WalletHistory, EventReferral } from '../models/database'
import bcrypt from 'bcrypt'
import type { 
  TagModel, 
  UserModel, 
  EventModel, 
  OptionModel, 
  BetModel, 
  WalletHistoryModel, 
  EventReferralModel 
} from '~/types/models'

export const seedDatabase = async () => {
  try {
    // ایجاد تگ‌ها
    const tags = await Tag.bulkCreate([
      { name: 'ورزشی' },
      { name: 'سیاسی' },
      { name: 'اقتصادی' },
      { name: 'فوتبال' },
      { name: 'انتخابات' }
    ]) as TagModel[]
    console.log('Tags created:', tags)

    // ایجاد کاربران
    const hashedAdminPass = await bcrypt.hash('admin123', 10)
    const hashedJohnPass = await bcrypt.hash('john123', 10)
    const hashedSarahPass = await bcrypt.hash('sarah123', 10)
    const hashedBlockedPass = await bcrypt.hash('blocked123', 10)

    const users = await User.bulkCreate([
      {
        username: 'admin',
        password: hashedAdminPass,
        role: 'admin',
        balance: 10000,
        commission: 500,
        points: 1000
      },
      {
        username: 'john',
        password: hashedJohnPass,
        role: 'user',
        balance: 5000,
        commission: 200,
        points: 500
      },
      {
        username: 'sarah',
        password: hashedSarahPass,
        role: 'user',
        balance: 3000,
        commission: 100,
        points: 300
      },
      {
        username: 'blocked_user',
        password: hashedBlockedPass,
        role: 'user',
        balance: 0,
        commission: 0,
        points: 0,
        is_blocked: true
      }
    ]) as UserModel[]
    console.log('Users created:', users)

    // ایجاد رویدادها
    const events = await Event.bulkCreate([
      {
        title: 'فینال جام جهانی',
        description: 'فینال جام جهانی 2026',
        creator_id: users[0].id,
        start_date: new Date('2026-07-10'),
        end_date: new Date('2026-07-10'),
        status: 'active',
        commission_creator: 0.05,
        commission_referral: 0.02,
        participants_count: 100,
        total_bets: 5000
      },
      {
        title: 'فینال لیگ قهرمانان',
        description: 'فینال لیگ قهرمانان اروپا 2024',
        creator_id: users[1].id,
        start_date: new Date('2024-05-30'),
        end_date: new Date('2024-05-30'),
        status: 'active',
        commission_creator: 0.04,
        commission_referral: 0.01,
        participants_count: 80,
        total_bets: 4000
      },
      {
        title: 'قیمت دلار',
        description: 'پیش‌بینی قیمت دلار در پایان سال',
        creator_id: users[0].id,
        start_date: new Date('2024-03-19'),
        end_date: new Date('2024-03-20'),
        status: 'active',
        commission_creator: 0.03,
        commission_referral: 0.01,
        participants_count: 50,
        total_bets: 2000
      },
      {
        title: 'دربی تهران',
        description: 'دربی 99 پایتخت',
        creator_id: users[1].id,
        start_date: new Date('2024-04-15'),
        end_date: new Date('2024-04-15'),
        status: 'active',
        commission_creator: 0.05,
        commission_referral: 0.02,
        participants_count: 200,
        total_bets: 10000
      }
    ]) as EventModel[]
    console.log('Events created:', events)

    // ایجاد گزینه‌ها
    const options = await Option.bulkCreate([
      { event_id: events[0].id, text: 'آرژانتین', odds: 2.5 },
      { event_id: events[0].id, text: 'برزیل', odds: 2.2 },
      { event_id: events[1].id, text: 'رئال مادرید', odds: 1.8 },
      { event_id: events[1].id, text: 'منچستر سیتی', odds: 2.0 },
      { event_id: events[2].id, text: 'کمتر از ۵۰ هزار تومان', odds: 3.0 },
      { event_id: events[2].id, text: 'بین ۵۰ تا ۵۵ هزار تومان', odds: 2.5 },
      { event_id: events[3].id, text: 'پرسپولیس', odds: 2.1 },
      { event_id: events[3].id, text: 'استقلال', odds: 2.1 }
    ]) as OptionModel[]
    console.log('Options created:', options)

    // ایجاد شرط‌ها
    const bets = await Bet.bulkCreate([
      {
        user_id: users[1].id,
        event_id: events[0].id,
        option_id: options[0].id,
        amount: 1000,
        potential_win: 2500,
        status: 'active'
      },
      {
        user_id: users[2].id,
        event_id: events[1].id,
        option_id: options[2].id,
        amount: 2000,
        potential_win: 3600,
        status: 'won'
      },
      {
        user_id: users[1].id,
        event_id: events[2].id,
        option_id: options[4].id,
        amount: 1500,
        potential_win: 4500,
        status: 'active'
      },
      {
        user_id: users[2].id,
        event_id: events[3].id,
        option_id: options[6].id,
        amount: 1000,
        potential_win: 2100,
        status: 'lost'
      }
    ]) as BetModel[]
    console.log('Bets created:', bets)

    // ایجاد تاریخچه کیف پول
    const walletHistory = await WalletHistory.bulkCreate([
      {
        user_id: users[1].id,
        type: 'deposit',
        amount: 5000,
        description: 'شارژ اولیه'
      },
      {
        user_id: users[1].id,
        type: 'bet',
        amount: -1000,
        description: 'شرط روی فینال جام جهانی'
      },
      {
        user_id: users[2].id,
        type: 'win',
        amount: 4000,
        description: 'برد در شرط فینال لیگ قهرمانان'
      },
      {
        user_id: users[2].id,
        type: 'deposit',
        amount: 10000,
        description: 'شارژ حساب'
      },
      {
        user_id: users[2].id,
        type: 'bet',
        amount: -1500,
        description: 'شرط روی قیمت دلار'
      }
    ]) as WalletHistoryModel[]
    console.log('Wallet history created:', walletHistory)

    // ایجاد ارجاعات رویداد
    const eventReferrals = await EventReferral.bulkCreate([
      {
        event_id: events[0].id,
        referrer_id: users[1].id,
        referred_count: 5,
        total_commission: 100
      },
      {
        event_id: events[1].id,
        referrer_id: users[2].id,
        referred_count: 3,
        total_commission: 60
      }
    ]) as EventReferralModel[]
    console.log('Event referrals created:', eventReferrals)

    return {
      success: true,
      message: 'Database seeded successfully'
    }
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
} 