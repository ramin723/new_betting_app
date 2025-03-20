import { Redis } from 'ioredis';
import { useRuntimeConfig } from '#imports';

const config = useRuntimeConfig();

export const redis = new Redis(config.public.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log('✅ اتصال به Redis با موفقیت برقرار شد.');
});

redis.on('error', (error) => {
  console.error('❌ خطا در اتصال به Redis:', error);
}); 