import { defineEventHandler, createError, readBody, getQuery, getRouterParams } from 'h3'
import { useRuntimeConfig } from '#imports'
import { NuxtAuthHandler } from '#auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { User } from '../../models/User'
import { USER_ROLES } from '../../constants/constants'
import type { UserAttributes } from '../../models/types/UserInterface'
import type { JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  return NuxtAuthHandler({
    secret: config.auth.secret,
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          username: { label: 'Username', type: 'text' },
          password: { label: 'Password', type: 'password' }
        },
        async authorize(credentials: Record<"username" | "password", string> | undefined) {
          if (!credentials?.username || !credentials?.password) {
            throw new Error('نام کاربری و رمز عبور الزامی است')
          }

          const user = await User.findOne({
            where: {
              username: credentials.username
            }
          })

          if (!user) {
            throw new Error('کاربری با این نام کاربری یافت نشد')
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)

          if (!isValid) {
            throw new Error('رمز عبور اشتباه است')
          }

          return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            balance: user.balance,
            isBlocked: user.isBlocked,
            total_referral_earnings: user.total_referral_earnings,
            avatar: user.avatar,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      })
    ],
    callbacks: {
      jwt({ token, user }) {
        if (user) {
          token.user = user
        }
        return token
      },
      session({ session, token }) {
        if (token.user) {
          session.user = token.user
        }
        return session
      }
    }
  })
}) 