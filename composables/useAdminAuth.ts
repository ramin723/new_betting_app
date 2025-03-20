import { ref } from 'vue'
import type { ExtendedUser } from '~/types/admin'
import { useFetch } from '#imports'

export const useAdminAuth = () => {
  const user = ref<ExtendedUser | null>(null)
  const isLoading = ref(false)

  const initialize = async () => {
    isLoading.value = true
    try {
      const { data } = await useFetch('/api/auth/me')
      if (data.value?.user) {
        user.value = data.value.user
        return user.value?.role === 'admin'
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  const checkPermission = (permission: string) => {
    if (!user.value) return false
    if (user.value.role === 'admin') return true
    return false
  }

  return {
    user,
    isLoading,
    initialize,
    checkPermission
  }
} 