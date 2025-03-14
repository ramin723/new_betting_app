import { defineEventHandler, createError, readBody, setCookie } from 'h3'
import { User } from '../../models/database'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { useRuntimeConfig } from '#imports'
import type { UserModel } from '~/types/models'
import { AUTH_CONSTANTS } from '../../constants/auth'

export default defineEventHandler(async (event) => {
  console.log('🔵 Login API endpoint called')
  try {
    const body = await readBody(event)
    console.log('🟡 Request body received:', { username: body.username, hasPassword: !!body.password })

    const { username, password } = body

    // اعتبارسنجی ورودی‌ها
    if (!username || !password) {
      console.log('🔴 Missing credentials')
      throw createError({
        statusCode: 400,
        message: 'نام کاربری و رمز عبور الزامی است'
      })
    }

    // پیدا کردن کاربر در دیتابیس
    console.log('🟡 Looking up user in database')
    const user = await User.findOne({ 
      where: { username: body.username },
      attributes: ['id', 'username', 'password', 'role', 'balance']
    }) as UserModel
    if (!user || !user.password) {
      console.log('🔴 User not found or no password set')
      throw createError({
        statusCode: 401,
        message: 'نام کاربری یا رمز عبور اشتباه است'
      })
    }

    // بررسی رمز عبور
    console.log('🟡 Checking password')
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log('🔴 Invalid password')
      throw createError({
        statusCode: 401,
        message: 'نام کاربری یا رمز عبور اشتباه است'
      })
    }

    // ایجاد توکن JWT
    console.log('🟢 Creating JWT token')
    const config = useRuntimeConfig()
    const token = jwt.sign(
      { userId: user.id },
      config.auth?.secret || AUTH_CONSTANTS.DEFAULT_JWT_SECRET,
      { expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRY }
    )

    // تنظیم کوکی
    console.log('🟢 Setting auth cookie')
    const cookieName = config.auth?.cookieName || AUTH_CONSTANTS.DEFAULT_COOKIE_NAME
    console.log('🟡 Using cookie name:', cookieName)
    
    setCookie(event, cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AUTH_CONSTANTS.COOKIE_MAX_AGE,
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
    })

    console.log('🟢 Cookie set with token:', token.substring(0, 20) + '...')

    // حذف رمز عبور از پاسخ
    const { password: _, ...userWithoutPassword } = user.toJSON()

    console.log('🟢 Login successful, returning user data')
    return {
      success: true,
      user: userWithoutPassword
    }
  } catch (err: any) {
    console.error('🔴 Login error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'خطای سرور'
    })
  }
}) 