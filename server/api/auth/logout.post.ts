import { defineEventHandler, setCookie } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  console.log('🔵 Logout API endpoint called');
  
  const config = useRuntimeConfig()
  const cookieName = config.auth?.cookieName || 'auth_token'
  
  // حذف کوکی با تنظیم تاریخ انقضا در گذشته
  setCookie(event, cookieName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/'
  })

  console.log('🟢 Auth cookie cleared');
  
  return {
    success: true
  }
}) 