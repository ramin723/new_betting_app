import { useNuxtApp } from '#imports'
import type { AdminProfile } from '~/types/admin'

export const useSecurity = () => {
  const { $supabase } = useNuxtApp()

  const checkLoginAttempts = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await $supabase
        .from('admin_profiles')
        .select('failed_login_attempts, last_failed_login')
        .eq('user_id', userId)
        .single()

      if (error) throw error

      const maxAttempts = 5
      const lockoutDuration = 30 * 60 * 1000 // 30 minutes in milliseconds

      if (!data) return true

      const { failed_login_attempts, last_failed_login } = data as AdminProfile
      const now = Date.now()
      const lastFailed = new Date(last_failed_login || '').getTime()

      if (failed_login_attempts >= maxAttempts) {
        if (now - lastFailed < lockoutDuration) {
          return false
        }
        // Reset attempts if lockout period has expired
        await resetLoginAttempts(userId)
        return true
      }

      return true
    } catch (error) {
      console.error('Error checking login attempts:', error)
      return true // Allow login on error
    }
  }

  const incrementLoginAttempts = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await $supabase
        .from('admin_profiles')
        .select('failed_login_attempts')
        .eq('user_id', userId)
        .single()

      if (error) throw error

      const currentAttempts = data?.failed_login_attempts || 0
      const { error: updateError } = await $supabase
        .from('admin_profiles')
        .upsert({
          user_id: userId,
          failed_login_attempts: currentAttempts + 1,
          last_failed_login: new Date().toISOString()
        })

      if (updateError) throw updateError
    } catch (error) {
      console.error('Error incrementing login attempts:', error)
    }
  }

  const resetLoginAttempts = async (userId: string): Promise<void> => {
    try {
      const { error } = await $supabase
        .from('admin_profiles')
        .upsert({
          user_id: userId,
          failed_login_attempts: 0,
          last_failed_login: null
        })

      if (error) throw error
    } catch (error) {
      console.error('Error resetting login attempts:', error)
    }
  }

  const validatePassword = (password: string): boolean => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    )
  }

  return {
    checkLoginAttempts,
    incrementLoginAttempts,
    resetLoginAttempts,
    validatePassword
  }
} 