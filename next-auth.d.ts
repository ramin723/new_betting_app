import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: number
      username: string
      first_name?: string
      last_name?: string
      email?: string
      role: 'admin' | 'user'
      balance: number
      avatar?: string
      commission?: number
      points?: number
    } & DefaultSession['user']
  }
} 