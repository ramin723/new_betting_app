import { Event, Option, Tag, EventTag } from '../../models/database';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    // ایجاد یک رویداد تست
    const now = new Date();
    const testEvent = await Event.create({
      title: 'رویداد تست',
      description: 'این یک رویداد تست برای بررسی عملکرد سیستم است',
      event_type: 'yes_no',
      question: 'آیا این تست موفق خواهد بود؟',
      result_time: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 ساعت بعد
      betting_deadline: new Date(now.getTime() + 23 * 60 * 60 * 1000), // 23 ساعت بعد
      start_time: now,
      end_time: new Date(now.getTime() + 25 * 60 * 60 * 1000), // 25 ساعت بعد
      status: 'active',
      total_pool: 0,
      commission_creator: 0.02,
      commission_referral: 0.05,
      is_featured: false,
      reference_event: 'تست سیستم',
      reference_link: 'https://example.com'
    });

    // ایجاد گزینه‌های تست
    const options = await Option.bulkCreate([
      {
        event_id: testEvent.id,
        text: 'بله',
        value: 'yes',
        odds: 2.0,
        order: 1,
        total_bets: 0,
        total_amount: 0
      },
      {
        event_id: testEvent.id,
        text: 'خیر',
        value: 'no',
        odds: 2.0,
        order: 2,
        total_bets: 0,
        total_amount: 0
      }
    ]);

    // ایجاد تگ تست
    const testTag = await Tag.create({
      name: 'تست',
      status: 'approved'
    });

    // اضافه کردن تگ به رویداد
    await EventTag.create({
      event_id: testEvent.id,
      tag_id: testTag.id
    });

    return {
      success: true,
      message: 'رویداد تست با موفقیت ایجاد شد',
      event: {
        id: testEvent.id,
        title: testEvent.title
      }
    };

  } catch (error) {
    console.error('Error creating test event:', error);
    return {
      success: false,
      message: error.message || 'خطا در ایجاد رویداد تست'
    };
  }
}); 