import { Event, User, Tag, EventTag } from '../../models/database';

export default defineEventHandler(async (event) => {
  try {
    // ایجاد یک کاربر ادمین برای ساخت رویدادها
    const [admin] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        password: 'admin123', // در محیط واقعی باید هش شود
        role: 'admin'
      }
    });

    // دریافت تگ‌های موجود
    const tags = await Tag.findAll();
    if (tags.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'لطفاً ابتدا تگ‌ها را با استفاده از /api/tags/seed ایجاد کنید.'
      });
    }

    // رویدادهای تستی
    const testEvents = [
      {
        title: "پیش‌بینی قیمت بیت‌کوین",
        description: "قیمت بیت‌کوین در ۲۴ ساعت آینده به چه عددی خواهد رسید؟",
        option_1: "بالای ۵۰,۰۰۰ دلار",
        option_2: "زیر ۵۰,۰۰۰ دلار",
        start_time: new Date(),
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        creator_id: admin.id,
        status: 'active',
        tags: ['TON/Crypto', 'Bitcoin']
      },
      {
        title: "فینال لیگ قهرمانان",
        description: "برنده فینال لیگ قهرمانان اروپا کدام تیم خواهد بود؟",
        option_1: "رئال مادرید",
        option_2: "منچستر سیتی",
        start_time: new Date(),
        end_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
        creator_id: admin.id,
        status: 'active',
        tags: ['Sport', 'Football']
      },
      {
        title: "مسابقات CS:GO",
        description: "برنده مسابقه CS:GO بین تیم‌های Navi و FaZe",
        option_1: "Navi",
        option_2: "FaZe",
        start_time: new Date(),
        end_time: new Date(Date.now() + 12 * 60 * 60 * 1000),
        creator_id: admin.id,
        status: 'active',
        tags: ['Esports', 'CS:GO']
      },
      {
        title: "نبرد ممکوین‌ها",
        description: "کدام ممکوین در ۲۴ ساعت آینده رشد بیشتری خواهد داشت؟",
        option_1: "PEPE",
        option_2: "DOGE",
        start_time: new Date(),
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        creator_id: admin.id,
        status: 'active',
        tags: ['Battles', 'Meme coins']
      }
    ];

    const createdEvents = [];

    // ایجاد رویدادها و اتصال تگ‌ها
    for (const eventData of testEvents) {
      const { tags: tagNames, ...eventDetails } = eventData;
      
      // ایجاد رویداد
      const newEvent = await Event.create(eventDetails);
      
      // پیدا کردن و اتصال تگ‌ها
      for (const tagName of tagNames) {
        const tag = tags.find(t => t.name === tagName);
        if (tag) {
          await EventTag.create({
            event_id: newEvent.id,
            tag_id: tag.id
          });
        }
      }

      // دریافت رویداد با تگ‌هایش
      const eventWithTags = await Event.findByPk(newEvent.id, {
        include: [{
          model: Tag,
          through: { attributes: [] }
        }]
      });

      createdEvents.push(eventWithTags);
    }

    return {
      success: true,
      message: 'رویدادهای تستی با موفقیت ایجاد شدند',
      events: createdEvents
    };

  } catch (error) {
    console.error('Error seeding events:', error);
    throw createError({
      statusCode: 500,
      message: error.message || 'خطا در ایجاد رویدادهای تستی'
    });
  }
}); 