import { EventTemplate } from '../../models/database';

const defaultTemplates = [
  // قالب‌های نوع yes/no
  {
    name: 'پیش‌بینی رویداد آینده',
    type: 'yes_no',
    question_template: 'آیا {event} قبل از {date} اتفاق خواهد افتاد؟',
    default_deadline_hours: 24,
    required_fields: {
      event: 'string',
      date: 'date'
    },
    is_active: true
  },
  {
    name: 'پیش‌بینی نتیجه',
    type: 'yes_no',
    question_template: 'آیا {team_a} در مقابل {team_b} برنده خواهد شد؟',
    default_deadline_hours: 2,
    required_fields: {
      team_a: 'string',
      team_b: 'string',
      match_time: 'date'
    },
    is_active: true
  },
  
  // قالب‌های نوع winner
  {
    name: 'برنده مسابقه',
    type: 'winner',
    question_template: 'کدام تیم در {tournament} قهرمان خواهد شد؟',
    default_deadline_hours: 48,
    required_fields: {
      tournament: 'string',
      teams: 'array',
      final_date: 'date'
    },
    is_active: true
  },
  {
    name: 'برنده جایزه',
    type: 'winner',
    question_template: 'چه کسی برنده {award} در {event} خواهد شد؟',
    default_deadline_hours: 24,
    required_fields: {
      award: 'string',
      event: 'string',
      nominees: 'array',
      ceremony_date: 'date'
    },
    is_active: true
  },
  
  // قالب‌های نوع custom
  {
    name: 'نتیجه بازی',
    type: 'custom',
    question_template: 'نتیجه بازی {team_a} و {team_b} چند خواهد شد؟',
    default_deadline_hours: 2,
    required_fields: {
      team_a: 'string',
      team_b: 'string',
      match_time: 'date',
      possible_scores: 'array'
    },
    is_active: true
  }
];

export default defineEventHandler(async (event) => {
  try {
    // حذف تمام قالب‌های موجود
    await EventTemplate.destroy({ where: {} });
    
    // ایجاد قالب‌های پیش‌فرض
    const templates = await EventTemplate.bulkCreate(defaultTemplates);
    
    return {
      success: true,
      message: 'قالب‌های پیش‌فرض با موفقیت ایجاد شدند.',
      templates
    };
  } catch (error) {
    console.error('Error seeding templates:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در ایجاد قالب‌های پیش‌فرض.',
    });
  }
}); 