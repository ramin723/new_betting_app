import { ref, readonly } from 'vue'
import type { 
  AdminRole, 
  AdminPermission, 
  LoginHistory,
  UserRoleResponse,
  RolePermissionResponse,
  ExtendedUser,
  AdminProfile
} from '~/types/admin'
import { useSecurity } from './useSecurity'
import { generateTOTP, verifyTOTP } from '~/utils/totp'
import { useNuxtApp, useRuntimeConfig } from '#imports'

interface AuthMeResponse {
  success: boolean
  user: {
    id: number
    username: string
    isBlocked: boolean
    balance: number
    role: "admin" | "user"
    email: string
    createdAt: string
    updatedAt: string
  }
}

export const useAdminAuth = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase || 'http://localhost:3000'
  
  const user = ref<ExtendedUser | null>(null)
  const { checkLoginAttempts, incrementLoginAttempts, resetLoginAttempts, validatePassword } = useSecurity()
  
  const permissions = ref<AdminPermission[]>([])
  const isLoading = ref(false)
  const requires2FA = ref(false)
  const tempSecret = ref<string | null>(null)
  const is2FAEnabled = ref(false)

  const checkPermission = (permissionName: string) => {
    return permissions.value.some((p: AdminPermission) => p.name === permissionName)
  }

  const checkModuleAccess = (moduleName: string) => {
    return permissions.value.some((p: AdminPermission) => p.module === moduleName)
  }

  const setup2FA = async () => {
    try {
      const secret = generateTOTP()
      tempSecret.value = secret
      return secret
    } catch (error) {
      console.error('خطا در راه‌اندازی احراز هویت دو مرحله‌ای:', error)
      return null
    }
  }

  const verify2FA = async (token: string) => {
    try {
      if (!tempSecret.value) return false
      const isValid = verifyTOTP(tempSecret.value, token)
      if (isValid) {
        requires2FA.value = false
        tempSecret.value = null
        return true
      }
      return false
    } catch (error) {
      console.error('خطا در تأیید کد احراز هویت دو مرحله‌ای:', error)
      return false
    }
  }

  const initialize = async () => {
    try {
      isLoading.value = true
      
      const { data: response } = await useFetch<AuthMeResponse>('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.value?.success) {
        user.value = null
        permissions.value = []
        return
      }

      const userData = response.value.user
      user.value = {
        id: userData.id.toString(),
        is_active: !userData.isBlocked,
        username: userData.username,
        balance: userData.balance,
        role: userData.role as "admin" | "user",
        email: userData.email,
        created_at: userData.createdAt,
        updated_at: userData.updatedAt
      }

      // اگر کاربر ادمین نیست، دسترسی نداشته باشد
      if (!user.value || user.value.role !== 'admin') {
        throw new Error('شما دسترسی لازم برای ورود به پنل ادمین را ندارید')
      }

      // فعلاً permissions را خالی می‌گذاریم
      permissions.value = []
      
    } catch (error) {
      console.error('خطا در بررسی وضعیت ادمین:', error)
      user.value = null
      permissions.value = []
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await useFetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      user.value = null
      permissions.value = []
      navigateTo('/login')
    } catch (error) {
      console.error('خطا در خروج از سیستم:', error)
    }
  }

  return {
    user: readonly(user),
    permissions: readonly(permissions),
    isLoading: readonly(isLoading),
    requires2FA: readonly(requires2FA),
    tempSecret: readonly(tempSecret),
    is2FAEnabled: readonly(is2FAEnabled),
    checkPermission,
    checkModuleAccess,
    initialize,
    validatePassword,
    setup2FA,
    verify2FA,
    logout
  }
} 