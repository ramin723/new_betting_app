import { defineEventHandler, createError, getCookie, getRequestHeaders } from 'h3'
import jwt from 'jsonwebtoken'
import { User } from '../../models/database'
import { useRuntimeConfig } from '#imports'
import { AUTH_CONSTANTS } from '../../constants/auth'

interface UserAttributes {
  id: number;
  username: string;
  role: string;
  [key: string]: any;
}

export default defineEventHandler(async (event) => {
  console.log('🔵 Me API endpoint called')
  try {
    console.log('🔵 [/api/auth/me] Checking authentication...');
    const config = useRuntimeConfig()
    const cookieName = config.auth?.cookieName || AUTH_CONSTANTS.DEFAULT_COOKIE_NAME
    const secret = config.auth?.secret || AUTH_CONSTANTS.DEFAULT_JWT_SECRET
    
    // لاگ هدرهای درخواست
    const headers = getRequestHeaders(event)
    console.log('🟡 [/api/auth/me] Request headers:', headers)
    
    // دریافت توکن از کوکی
    const token = getCookie(event, cookieName)
    console.log('🟡 [/api/auth/me] Token exists:', !!token)
    console.log('🟡 [/api/auth/me] Token value:', token ? token.substring(0, 20) + '...' : 'null')
    
    if (!token) {
      console.log('🔴 [/api/auth/me] No token found')
      throw createError({
        statusCode: 401,
        message: 'لطفاً وارد شوید'
      })
    }

    // بررسی اعتبار توکن
    let decoded
    try {
      decoded = jwt.verify(token, secret) as { userId: number }
      console.log('🟢 [/api/auth/me] Token verified, userId:', decoded.userId)
    } catch (err) {
      console.error('🔴 [/api/auth/me] Token verification error:', err)
      throw createError({
        statusCode: 401,
        message: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید'
      })
    }

    if (!decoded?.userId) {
      console.error('🔴 [/api/auth/me] No userId in token')
      throw createError({
        statusCode: 401,
        message: 'توکن نامعتبر است. لطفاً دوباره وارد شوید'
      })
    }

    // دریافت اطلاعات کاربر
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    }) as unknown as UserAttributes | null;
    
    console.log('🟡 [/api/auth/me] User found:', !!user)
    if (user) {
      console.log('🟢 [/api/auth/me] User details:', {
        id: user.id,
        username: user.username,
        role: user.role
      })
    }
    
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'حساب کاربری شما یافت نشد'
      })
    }

    console.log('🟢 [/api/auth/me] Authentication successful')
    return {
      success: true,
      user
    }
  } catch (err: any) {
    console.error('🔴 [/api/auth/me] Error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'خطای سرور'
    })
  }
}) 