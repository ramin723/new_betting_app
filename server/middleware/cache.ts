import { defineEventHandler } from 'h3';
import { Redis } from 'ioredis';
import { useRuntimeConfig } from '#imports';
import { CACHE_TTL } from '../constants/constants';
import { eventCache, userCache, betCache, walletCache } from '../config/cache';

const config = useRuntimeConfig();
const redis = new Redis(config.redisUrl);

const cacheConfigs: Record<string, { ttl: number; key: string }> = {
  '/api/events': { ttl: CACHE_TTL.EVENTS, key: 'events' },
  '/api/users': { ttl: CACHE_TTL.USERS, key: 'users' },
  '/api/bets': { ttl: CACHE_TTL.BETS, key: 'bets' },
  '/api/wallet': { ttl: CACHE_TTL.WALLET, key: 'wallet' }
};

export default defineEventHandler(async (event) => {
  const path = event.path;
  
  // مسیرهایی که نیاز به کش ندارند
  if (path.startsWith('/api/auth') || 
      path.startsWith('/api/admin') || 
      path.includes('_nuxt') || 
      path.includes('favicon.ico')) {
    return;
  }

  // بررسی کش بر اساس نوع درخواست
  if (path.startsWith('/api/events')) {
    const cachedData = await eventCache.get(path);
    if (cachedData) {
      event.node.res.setHeader('X-Cache', 'HIT');
      return cachedData;
    }
    event.node.res.setHeader('X-Cache', 'MISS');
  } else if (path.startsWith('/api/users')) {
    const cachedData = await userCache.get(path);
    if (cachedData) {
      event.node.res.setHeader('X-Cache', 'HIT');
      return cachedData;
    }
    event.node.res.setHeader('X-Cache', 'MISS');
  } else if (path.startsWith('/api/bets')) {
    const cachedData = await betCache.get(path);
    if (cachedData) {
      event.node.res.setHeader('X-Cache', 'HIT');
      return cachedData;
    }
    event.node.res.setHeader('X-Cache', 'MISS');
  } else if (path.startsWith('/api/wallet')) {
    const cachedData = await walletCache.get(path);
    if (cachedData) {
      event.node.res.setHeader('X-Cache', 'HIT');
      return cachedData;
    }
    event.node.res.setHeader('X-Cache', 'MISS');
  }

  const cacheConfig = cacheConfigs[path];
  if (!cacheConfig) {
    return;
  }

  try {
    const cacheKey = `cache:${path}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      event.node.res.setHeader('X-Cache', 'HIT');
      return JSON.parse(cachedData);
    }

    event.node.res.setHeader('X-Cache', 'MISS');
    
    // ذخیره نتیجه در کش
    const result = await event.node.req;
    await redis.setex(cacheKey, cacheConfig.ttl, JSON.stringify(result));
    
    return result;
  } catch (error) {
    console.error('Cache error:', error);
  }
}); 