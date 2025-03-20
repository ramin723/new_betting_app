import { z } from 'zod';
import { EVENT_TYPES, BET_STATUS, WALLET_HISTORY_TYPE, WALLET_HISTORY_STATUS } from '../constants/constants';

export const ValidationSchemas = {
  // اسکیمای کاربر
  user: {
    create: z.object({
      username: z.string().min(3).max(50),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(['user', 'admin', 'moderator']).default('user')
    }),
    update: z.object({
      username: z.string().min(3).max(50).optional(),
      email: z.string().email().optional(),
      role: z.enum(['user', 'admin', 'moderator']).optional()
    })
  },

  // اسکیمای رویداد
  event: {
    create: z.object({
      title: z.string().min(3).max(200),
      description: z.string().optional(),
      event_type: z.enum(['SPORTS', 'POLITICS', 'ENTERTAINMENT', 'TECHNOLOGY', 'OTHER']),
      question: z.string(),
      options: z.array(z.object({
        text: z.string(),
        value: z.number(),
        odds: z.number().min(1)
      })),
      betting_deadline: z.date(),
      result_time: z.date(),
      total_pool: z.number().min(0).default(0),
      is_featured: z.boolean().default(false)
    }),
    update: z.object({
      title: z.string().min(3).max(200).optional(),
      description: z.string().optional(),
      event_type: z.enum(['SPORTS', 'POLITICS', 'ENTERTAINMENT', 'TECHNOLOGY', 'OTHER']).optional(),
      question: z.string().optional(),
      options: z.array(z.object({
        text: z.string(),
        value: z.number(),
        odds: z.number().min(1)
      })).optional(),
      betting_deadline: z.date().optional(),
      result_time: z.date().optional(),
      total_pool: z.number().min(0).optional(),
      is_featured: z.boolean().optional()
    })
  },

  // اسکیمای شرط
  bet: {
    create: z.object({
      event_id: z.number(),
      option_id: z.number(),
      amount: z.number().min(1)
    })
  },

  // اسکیمای کیف پول
  wallet: {
    deposit: z.object({
      amount: z.number().min(1),
      payment_method: z.string()
    }),
    withdraw: z.object({
      amount: z.number().min(1),
      bank_account: z.string()
    }),
    history: z.object({
      type: z.enum(['DEPOSIT', 'WITHDRAW', 'BET', 'WIN', 'COMMISSION', 'REFUND']),
      status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']),
      amount: z.number().min(1)
    })
  }
};

export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors.map(e => e.message).join(', '));
    }
    throw error;
  }
} 