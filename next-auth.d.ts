import { DefaultSession } from 'next-auth'
import type { SessionUser } from './types/auth'

declare module 'next-auth' {
  interface Session {
    user: SessionUser & DefaultSession['user']
  }
} 