import { MD5 } from 'crypto-js'

export function md5(str: string): string {
  // پیاده‌سازی ساده md5 برای Gravatar
  // این یک پیاده‌سازی ساده است و فقط برای نمایش آواتار استفاده می‌شود
  return MD5(str).toString()
} 