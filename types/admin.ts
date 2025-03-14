import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface AdminProfile {
  user_id: string
  two_factor_secret: string | null
  two_factor_enabled: boolean
  failed_login_attempts: number
  last_failed_login: string | null
  is2FAEnabled: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface AdminRole {
  id: string
  name: string
  description: string
  email: string
  requires_2fa: boolean
  created_at?: string
  updated_at?: string
}

export interface AdminPermission {
  id: string
  name: string
  description: string
  module: string
  created_at?: string
  updated_at?: string
}

export interface UserRole {
  id: number
  user_id: number
  role_id: number
  created_at: string
}

export interface RolePermission {
  id: number
  role_id: number
  permission_id: number
  created_at: string
}

export interface AdminActivityLog {
  id: number
  admin_id: number
  action: string
  module: string
  description: string | null
  ip_address: string | null
  created_at: string
}

export interface Event {
  id: number
  title: string
  description: string
  date: string
  status: 'draft' | 'active' | 'completed'
  participants_count: number
}

export interface Transaction {
  id: number
  user: string
  event: string
  amount: number
  date: string
}

export interface Stats {
  totalUsers: number
  activeEvents: number
  totalTransactions: number
  dailyTransactions: Array<{
    date: string
    amount: number
  }>
}

export interface LoginHistory {
  id: string
  user_id: string
  ip_address: string
  user_agent: string
  success: boolean
  created_at: string
}

export interface UserRoleResponse {
  role: AdminRole
}

export interface RolePermissionResponse {
  permission: AdminPermission
}

export interface ExtendedUser {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
  is_active: boolean
  balance: number
  created_at?: string
  updated_at?: string
  app_metadata?: Record<string, any>
  user_metadata?: Record<string, any>
  aud?: string
}

export type User = ExtendedUser
export type AppUser = User

export interface SupabaseResponse<T> {
  data: T | null
  error: Error | null
}

export interface SupabaseUserResponse {
  user: ExtendedUser
} 