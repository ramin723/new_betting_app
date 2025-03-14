import { Event, Option, Tag, EventTag } from '../../models/database';
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    // فقط در محیط development قابل استفاده است
    if (process.env.NODE_ENV === 'production') {
      throw createError({
        statusCode: 404,
        message: 'این API در محیط production در دسترس نیست.'
      });
    }

    // تاریخ‌های پایه برای رویدادها
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // رویداد تست
    const testEvent = {
      title: 'رویداد تست',
      description: 'این یک رویداد تست است',
      event_type: 'yes_no',
      question: 'آیا این تست موفق خواهد بود؟', // فیلد اجباری
      result_time: nextWeek, // فیلد اجباری
      betting_deadline: tomorrow, // فیلد اجباری
      start_time: now,
      end_time: nextWeek,
      status: 'active',
      reference_event: 'تست سیستم',
      reference_link: 'https://example.com',
      total_pool: 0,
      commission_creator: 0.02,
      commission_referral: 0.05,
      is_featured: true
    };

    // ایجاد رویداد
    const createdEvent = await Event.create(testEvent);

    // ایجاد گزینه‌ها
    const options = [
      {
        event_id: createdEvent.id,
        text: 'بله',
        value: 'yes',
        odds: 2.0,
        order: 1
      },
      {
        event_id: createdEvent.id,
        text: 'خیر',
        value: 'no',
        odds: 2.0,
        order: 2
      }
    ];

    await Option.bulkCreate(options);

    // ایجاد تگ تست
    const [testTag] = await Tag.findOrCreate({
      where: { name: 'تست' },
      defaults: {
        name: 'تست',
        status: 'approved'
      }
    });

    // اتصال تگ به رویداد
    await EventTag.create({
      event_id: createdEvent.id,
      tag_id: testTag.id
    });

    return {
      success: true,
      message: 'رویداد تست با موفقیت ایجاد شد',
      event: {
        id: createdEvent.id,
        title: createdEvent.title,
        question: createdEvent.question,
        betting_deadline: createdEvent.betting_deadline,
        result_time: createdEvent.result_time
      }
    };

  } catch (error) {
    console.error('Error creating test event:', error);
    throw createError({
      statusCode: 500,
      message: error.message || 'خطا در ایجاد رویداد تست'
    });
  }
}); 