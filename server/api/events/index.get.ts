import { Op } from 'sequelize';
import { Event } from '../../models/Event';
import { Tag } from '../../models/Tag';
import { Option } from '../../models/Option';
import { User } from '../../models/User';
import { EventTemplate } from '../../models/EventTemplate';
import { defineEventHandler, createError, getQuery } from '#imports';
import { useRuntimeConfig } from '#imports';
import { EVENT_STATUS, EVENT_TYPES } from '../../constants/constants';
import type { EventModel } from '../../models/types/EventInterface';

interface EventQuery {
  sort?: 'newest' | 'deadline' | 'popular';
  all?: boolean;
  tags?: string;
  type?: keyof typeof EVENT_TYPES;
  status?: keyof typeof EVENT_STATUS;
  creator_id?: number;
  template_id?: number;
  search?: string;
  from_date?: string;
  to_date?: string;
  featured_only?: string;
  include_expired?: string;
}

export default defineEventHandler(async (event) => {
  console.log('🔵 [/api/events] Fetching events...');
  const config = useRuntimeConfig();
  const query = getQuery(event) as EventQuery;
  const { 
    sort, 
    all, 
    tags,
    type,
    status,
    creator_id,
    template_id,
    search,
    from_date,
    to_date,
    featured_only,
    include_expired
  } = query;

  try {
    // تنظیم شرط where
    const whereClause: any = {};

    // فیلتر وضعیت
    if (status) {
      whereClause.status = status;
    } else if (!all) {
      // اگر all=true نیامده باشد و status هم مشخص نشده، فقط رویدادهای active را نمایش بده
      whereClause.status = EVENT_STATUS.ACTIVE;
    }

    // فیلتر نوع رویداد
    if (type) {
      whereClause.event_type = type;
    }

    // فیلتر سازنده
    if (creator_id) {
      whereClause.creator_id = creator_id;
    }

    // فیلتر قالب
    if (template_id) {
      whereClause.template_id = template_id;
    }

    // فیلتر رویدادهای ویژه
    if (featured_only === 'true') {
      whereClause.is_featured = true;
    }

    // جستجو در عنوان و توضیحات
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { question: { [Op.like]: `%${search}%` } }
      ];
    }

    // فیلتر تاریخ
    if (from_date || to_date) {
      whereClause[Op.and] = [];
      
      if (from_date) {
        whereClause[Op.and].push({ result_time: { [Op.gte]: new Date(from_date) } });
      }
      
      if (to_date) {
        whereClause[Op.and].push({ result_time: { [Op.lte]: new Date(to_date) } });
      }
    }

    // فیلتر رویدادهای منقضی نشده
    if (include_expired !== 'true') {
      if (!whereClause[Op.and]) {
        whereClause[Op.and] = [];
      }
      whereClause[Op.and].push({ betting_deadline: { [Op.gt]: new Date() } });
    }

    // تنظیم مرتب‌سازی
    let order: [string, string][] = [['result_time', 'ASC']];

    if (sort === 'newest') {
      order = [['createdAt', 'DESC']];
    } else if (sort === 'deadline') {
      order = [['betting_deadline', 'ASC']];
    } else if (sort === 'popular') {
      order = [['total_pool', 'DESC']];
    }

    // تنظیم query نهایی
    const eventQuery = {
      where: whereClause,
      order,
      include: [
        {
          model: Tag,
          through: { attributes: [] },
        },
        {
          model: Option,
          as: 'Options',
          attributes: ['id', 'text', 'value', 'odds', 'total_bets', 'is_winner', 'order'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'role'],
        },
        {
          model: EventTemplate,
          as: 'template',
          attributes: ['id', 'name', 'type'],
        }
      ],
    };

    // فیلتر تگ‌ها
    if (tags) {
      const tagList = tags.split(',');
      (eventQuery.include[0] as any).where = {
        name: { [Op.in]: tagList },
      };
    }

    console.log('🟡 [/api/events] Executing query with:', {
      whereClause,
      order,
      tags: tags ? tags.split(',') : []
    });

    const events = await Event.findAll(eventQuery);
    console.log('🟢 [/api/events] Found', events.length, 'events');

    return { 
      success: true, 
      events,
      filters: {
        type,
        status,
        creator_id,
        template_id,
        search,
        from_date,
        to_date,
        featured_only,
        include_expired,
        tags
      }
    };
  } catch (error) {
    console.error('🔴 [/api/events] Error fetching events:', error);
    throw createError({
      statusCode: 500,
      message: 'خطا در دریافت لیست رویدادها.',
    });
  }
}); 