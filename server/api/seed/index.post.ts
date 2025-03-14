import { defineEventHandler } from 'h3'
import { User, Event, Bet, WalletHistory, EventReferral, Option, Tag, EventTag } from '../../models/database'
import bcrypt from 'bcrypt'
import type { UserModel, EventModel, BetModel, OptionModel, WalletHistoryModel, EventReferralModel, TagModel } from '~/types/models'

export default defineEventHandler(async () => {
  try {
    // حذف تمام داده‌های قبلی
    await Promise.all([
      User.destroy({ where: {} }),
      Event.destroy({ where: {} }),
      Bet.destroy({ where: {} }),
      WalletHistory.destroy({ where: {} }),
      EventReferral.destroy({ where: {} }),
      Option.destroy({ where: {} }),
      Tag.destroy({ where: {} }),
      EventTag.destroy({ where: {} })
    ])

    // ایجاد تگ‌های پایه
    const tags = await Tag.bulkCreate([
      { name: 'ورزشی', status: 'approved' },
      { name: 'سیاسی', status: 'approved' },
      { name: 'اقتصادی', status: 'approved' },
      { name: 'فوتبال', status: 'approved' },
      { name: 'انتخابات', status: 'approved' }
    ], { returning: true }) as TagModel[]

    console.log('Tags created:', tags.map(t => ({ id: t.id, name: t.name })))

    // Create test users
    const users = await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@test.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        balance: 50000,
        first_name: 'Admin',
        last_name: 'User',
        total_referral_earnings: 0,
        isBlocked: false
      },
      {
        username: 'john',
        email: 'john@test.com',
        password: await bcrypt.hash('john123', 10),
        role: 'user',
        balance: 25000,
        first_name: 'John',
        last_name: 'Doe',
        total_referral_earnings: 1000,
        isBlocked: false
      },
      {
        username: 'sarah',
        email: 'sarah@test.com',
        password: await bcrypt.hash('sarah123', 10),
        role: 'user',
        balance: 35000,
        first_name: 'Sarah',
        last_name: 'Smith',
        total_referral_earnings: 2000,
        isBlocked: false
      },
      {
        username: 'blocked_user',
        email: 'blocked@test.com',
        password: await bcrypt.hash('blocked123', 10),
        role: 'user',
        balance: 0,
        first_name: 'Blocked',
        last_name: 'User',
        total_referral_earnings: 0,
        isBlocked: true
      }
    ], { returning: true }) as UserModel[]

    console.log('Users created:', users.map(u => ({ id: u.id, username: u.username })))

    // تاریخ‌های پایه برای رویدادها
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Create test events
    const events = await Event.bulkCreate([
      {
        title: 'فینال جام جهانی',
        description: 'فینال جام جهانی ۲۰۲۴',
        creator_id: users[0].id, // admin
        event_type: 'winner',
        question: 'کدام تیم برنده جام جهانی ۲۰۲۴ خواهد شد؟',
        result_time: nextWeek,
        betting_deadline: tomorrow,
        start_time: now,
        status: 'active',
        is_featured: true,
        total_pool: 5000
      },
      {
        title: 'فینال لیگ قهرمانان',
        description: 'فینال لیگ قهرمانان اروپا ۲۰۲۴',
        creator_id: users[0].id,
        event_type: 'winner',
        question: 'کدام تیم برنده لیگ قهرمانان ۲۰۲۴ خواهد شد؟',
        result_time: nextWeek,
        betting_deadline: tomorrow,
        start_time: now,
        status: 'active',
        is_featured: true,
        total_pool: 3000
      },
      {
        title: 'قیمت دلار',
        description: 'پیش‌بینی قیمت دلار در پایان هفته',
        creator_id: users[0].id,
        event_type: 'custom',
        question: 'قیمت دلار در پایان هفته به چه عددی خواهد رسید؟',
        result_time: nextWeek,
        betting_deadline: tomorrow,
        start_time: now,
        status: 'active',
        is_featured: false,
        total_pool: 2000
      },
      {
        title: 'دربی تهران',
        description: 'نتیجه دربی پایتخت',
        creator_id: users[0].id,
        event_type: 'winner',
        question: 'برنده دربی تهران کدام تیم خواهد بود؟',
        result_time: lastWeek,
        betting_deadline: lastWeek,
        start_time: lastWeek,
        status: 'completed',
        is_featured: false,
        total_pool: 10000,
        winning_option_id: 1 // will be updated after options are created
      }
    ], { returning: true }) as EventModel[]

    console.log('Events created:', events.map(e => ({ id: e.id, title: e.title })))

    // Add tags to events
    await EventTag.bulkCreate([
      { event_id: events[0].id, tag_id: tags[0].id }, // ورزشی
      { event_id: events[0].id, tag_id: tags[3].id }, // فوتبال
      { event_id: events[1].id, tag_id: tags[0].id }, // ورزشی
      { event_id: events[1].id, tag_id: tags[3].id }, // فوتبال
      { event_id: events[2].id, tag_id: tags[2].id }, // اقتصادی
      { event_id: events[3].id, tag_id: tags[0].id }, // ورزشی
      { event_id: events[3].id, tag_id: tags[3].id }  // فوتبال
    ])

    // Create test options for events
    const options = await Option.bulkCreate([
      // برای جام جهانی
      {
        event_id: events[0].id,
        text: 'آرژانتین',
        value: 'argentina',
        odds: 2.0
      },
      {
        event_id: events[0].id,
        text: 'برزیل',
        value: 'brazil',
        odds: 2.5
      },
      // برای لیگ قهرمانان
      {
        event_id: events[1].id,
        text: 'رئال مادرید',
        value: 'real_madrid',
        odds: 1.8
      },
      {
        event_id: events[1].id,
        text: 'منچستر سیتی',
        value: 'man_city',
        odds: 2.2
      },
      // برای قیمت دلار
      {
        event_id: events[2].id,
        text: 'کمتر از ۵۰ هزار تومان',
        value: 'below_50',
        odds: 3.0
      },
      {
        event_id: events[2].id,
        text: 'بین ۵۰ تا ۵۵ هزار تومان',
        value: '50_55',
        odds: 2.0
      },
      // برای دربی
      {
        event_id: events[3].id,
        text: 'پرسپولیس',
        value: 'persepolis',
        odds: 2.0
      },
      {
        event_id: events[3].id,
        text: 'استقلال',
        value: 'esteghlal',
        odds: 2.0
      }
    ], { returning: true }) as OptionModel[]

    // Update winning option for completed event
    await Event.update(
      { winning_option_id: options[6].id }, // پرسپولیس برنده دربی
      { where: { id: events[3].id } }
    )

    console.log('Options created:', options.map(o => ({ id: o.id, text: o.text })))

    // Create test bets
    const bets = await Bet.bulkCreate([
      // شرط‌های john
      {
        user_id: users[1].id, // john
        event_id: events[0].id,
        bet_amount: 1000,
        option_id: options[0].id,
        status: 'active',
        potential_win_amount: 2000
      },
      {
        user_id: users[1].id, // john
        event_id: events[3].id,
        bet_amount: 2000,
        option_id: options[6].id,
        status: 'won',
        potential_win_amount: 4000,
        win_amount: 4000
      },
      // شرط‌های sarah
      {
        user_id: users[2].id, // sarah
        event_id: events[0].id,
        bet_amount: 1500,
        option_id: options[1].id,
        status: 'active',
        potential_win_amount: 3750
      },
      {
        user_id: users[2].id, // sarah
        event_id: events[3].id,
        bet_amount: 1000,
        option_id: options[7].id,
        status: 'lost',
        potential_win_amount: 2000,
        win_amount: 0
      }
    ], { returning: true }) as BetModel[]

    console.log('Bets created:', bets.map(b => ({ id: b.id, amount: b.bet_amount, status: b.status })))

    // Create test wallet history
    const walletHistory = await WalletHistory.bulkCreate([
      // تراکنش‌های john
      {
        user_id: users[1].id,
        amount: 5000,
        type: 'deposit',
        status: 'completed',
        old_balance: 20000,
        new_balance: 25000
      },
      {
        user_id: users[1].id,
        amount: -1000,
        type: 'bet',
        status: 'completed',
        bet_id: bets[0].id,
        old_balance: 25000,
        new_balance: 24000
      },
      {
        user_id: users[1].id,
        amount: 4000,
        type: 'win',
        status: 'completed',
        bet_id: bets[1].id,
        old_balance: 24000,
        new_balance: 28000
      },
      // تراکنش‌های sarah
      {
        user_id: users[2].id,
        amount: 10000,
        type: 'deposit',
        status: 'completed',
        old_balance: 25000,
        new_balance: 35000
      },
      {
        user_id: users[2].id,
        amount: -1500,
        type: 'bet',
        status: 'completed',
        bet_id: bets[2].id,
        old_balance: 35000,
        new_balance: 33500
      }
    ], { returning: true }) as WalletHistoryModel[]

    console.log('Wallet history created:', walletHistory.map(w => ({ id: w.id, type: w.type, amount: w.amount })))

    // Create test event referrals
    const eventReferrals = await EventReferral.bulkCreate([
      {
        event_id: events[0].id,
        referrer_id: users[1].id, // john
        referred_id: users[2].id  // sarah
      },
      {
        event_id: events[1].id,
        referrer_id: users[2].id, // sarah
        referred_id: users[1].id  // john
      }
    ], { returning: true }) as EventReferralModel[]

    console.log('Event referrals created:', eventReferrals.map(r => ({ id: r.id })))

    return {
      success: true,
      message: 'داده‌های تست با موفقیت ایجاد شدند'
    }

  } catch (error) {
    console.error('Error seeding test data:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        // @ts-ignore
        errors: error.errors
      })
    }
    return {
      success: false,
      message: 'خطا در ایجاد داده‌های تست',
      error: error instanceof Error ? error.message : 'خطای ناشناخته'
    }
  }
}) 