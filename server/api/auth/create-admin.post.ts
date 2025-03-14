import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcrypt'
import { Op } from 'sequelize'
import User from '~/models/User'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, email, password } = body

    if (!username || !email || !password) {
      throw createError({
        statusCode: 400,
        message: 'لطفاً تمام فیلدها را پر کنید'
      })
    }

    // بررسی وجود کاربر با همین ایمیل یا نام کاربری
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: 'این ایمیل یا نام کاربری قبلاً ثبت شده است'
      })
    }

    // رمزنگاری کلمه عبور
    const hashedPassword = await bcrypt.hash(password, 10)

    // ایجاد کاربر ادمین
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    })

    return {
      success: true,
      message: 'کاربر ادمین با موفقیت ایجاد شد',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'خطا در ایجاد کاربر ادمین'
    })
  }
}) 