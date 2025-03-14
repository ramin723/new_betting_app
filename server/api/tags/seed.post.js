import { Tag } from '../../models/database';

export default defineEventHandler(async (event) => {
  try {
    // تگ‌های اصلی
    const mainTags = [
      { name: 'Battles', status: 'approved' },
      { name: 'TON/Crypto', status: 'approved' },
      { name: 'Sport', status: 'approved' },
      { name: 'Esports', status: 'approved' }
    ];

    // ایجاد تگ‌های اصلی
    const createdMainTags = {};
    for (const tag of mainTags) {
      const [mainTag] = await Tag.findOrCreate({
        where: { name: tag.name },
        defaults: tag
      });
      createdMainTags[tag.name] = mainTag;
    }

    // تعریف زیرتگ‌ها
    const subTags = {
      'Battles': ['Token price', 'Meme coins', 'ETF'],
      'TON/Crypto': ['Bitcoin', 'Ethereum', 'TON', 'TON based projects'],
      'Sport': ['Football', 'Basketball', 'Tennis'],
      'Esports': ['CS:GO', 'Dota2', 'LoL']
    };

    // ایجاد زیرتگ‌ها
    for (const [mainTagName, subTagNames] of Object.entries(subTags)) {
      const mainTag = createdMainTags[mainTagName];
      
      for (const subTagName of subTagNames) {
        await Tag.findOrCreate({
          where: { name: subTagName },
          defaults: {
            name: subTagName,
            parent_id: mainTag.id,
            status: 'approved'
          }
        });
      }
    }

    return {
      success: true,
      message: 'تگ‌های پیش‌فرض با موفقیت ایجاد شدند'
    };

  } catch (error) {
    console.error('Error seeding tags:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در ایجاد تگ‌های پیش‌فرض'
    });
  }
}); 