import { defineEventHandler, createError } from 'h3';
import { Redis } from 'ioredis';
import { useRuntimeConfig } from '#imports';

const config = useRuntimeConfig();
const redis = new Redis(config.redisUrl);

const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 دقیقه
  MAX_REQUESTS: 100 // حداکثر 100 درخواست در هر پنجره زمانی
};

export default defineEventHandler(async (event) => {
  const ip = event.node.req.socket.remoteAddress;
  const key = `rate_limit:${ip}`;

  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, RATE_LIMIT.WINDOW_MS / 1000);
    }

    if (current > RATE_LIMIT.MAX_REQUESTS) {
      throw createError({
        statusCode: 429,
        message: 'تعداد درخواست‌های شما از حد مجاز بیشتر شده است. لطفاً کمی صبر کنید.'
      });
    }

    event.node.res.setHeader('X-RateLimit-Limit', RATE_LIMIT.MAX_REQUESTS);
    event.node.res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT.MAX_REQUESTS - current));
  } catch (error) {
    console.error('خطا در محدود کردن درخواست‌ها:', error);
  }
}); 