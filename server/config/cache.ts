import { redis } from './redis';
import { CACHE_TTL } from '../constants/constants';

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

export class Cache {
  private prefix: string;

  constructor(prefix: string = 'cache:') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(this.getKey(key));
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const { ttl = CACHE_TTL.MEDIUM } = options;
    await redis.setex(this.getKey(key), ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await redis.del(this.getKey(key));
  }

  async exists(key: string): Promise<boolean> {
    return (await redis.exists(this.getKey(key))) === 1;
  }

  async clear(pattern: string = '*'): Promise<void> {
    const keys = await redis.keys(this.getKey(pattern));
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fn();
    await this.set(key, value, options);
    return value;
  }
}

// ایجاد نمونه‌های مختلف کش برای کاربردهای مختلف
export const eventCache = new Cache('event:');
export const userCache = new Cache('user:');
export const betCache = new Cache('bet:');
export const walletCache = new Cache('wallet:'); 