import { defineEventHandler, createError } from 'h3';
import { z } from 'zod';

interface ValidationSchema {
  body?: z.ZodType<any>;
  query?: z.ZodType<any>;
  params?: z.ZodType<any>;
}

const validationSchemas: Record<string, ValidationSchema> = {
  '/api/events': {
    query: z.object({
      sort: z.enum(['newest', 'deadline', 'popular']).optional(),
      all: z.boolean().optional(),
      tags: z.string().optional(),
      type: z.string().optional(),
      status: z.string().optional(),
      creator_id: z.number().optional(),
      template_id: z.number().optional(),
      search: z.string().optional(),
      from_date: z.string().optional(),
      to_date: z.string().optional(),
      featured_only: z.string().optional(),
      include_expired: z.string().optional(),
    })
  },
  '/api/events/:id/bets': {
    params: z.object({
      id: z.string().transform(Number)
    }),
    body: z.object({
      option_id: z.number(),
      amount: z.number().min(1)
    })
  },
  '/api/wallet/deposit': {
    body: z.object({
      amount: z.number().min(1),
      payment_method: z.string()
    })
  },
  '/api/wallet/withdraw': {
    body: z.object({
      amount: z.number().min(1),
      bank_account: z.string()
    })
  }
};

export default defineEventHandler(async (event) => {
  const path = event.path;
  const schema = validationSchemas[path];
  
  if (!schema) {
    return;
  }

  try {
    // اعتبارسنجی query parameters
    if (schema.query) {
      const query = getQuery(event);
      schema.query.parse(query);
    }

    // اعتبارسنجی body
    if (schema.body && event.method !== 'GET') {
      const body = await readBody(event);
      schema.body.parse(body);
    }

    // اعتبارسنجی params
    if (schema.params) {
      const params = getRouterParams(event);
      schema.params.parse(params);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: 'داده‌های ارسالی نامعتبر هستند',
        data: error.errors
      });
    }
    throw error;
  }
}); 