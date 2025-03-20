import { USER_ROLES } from '~/server/constants/constants'
import type { DefaultSession } from 'next-auth'
import type { UserAttributes } from '~/server/models/types/UserInterface'

declare module 'next-auth' {
  interface User {
    id: number
    username: string
    email?: string
    role: keyof typeof USER_ROLES
    balance: number
    isBlocked: boolean
    total_referral_earnings: number
    avatar?: string
    createdAt: Date
    updatedAt: Date
  }

  interface Session {
    user: User & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: User
  }
} 