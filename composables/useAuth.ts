// @ts-ignore
import { useAuth as useSidebaseAuth } from '#imports'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

interface User {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role: 'admin' | 'user';
  balance: number;
  avatar?: string;
  commission?: number;
  points?: number;
}

interface AuthResponse {
  success: boolean;
  user: User;
  message?: string;
}

export function useCustomAuth() {
  const auth = useSidebaseAuth()
  const router = useRouter()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => {
    return auth.status.value === 'authenticated'
  })

  const user = computed(() => {
    return auth.data.value?.user as User | undefined
  })

  const isAdmin = computed(() => {
    return user.value?.role === 'admin'
  })

  const login = async (username: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await auth.signIn('credentials', {
        username,
        password,
        redirect: false
      })
      
      if (result?.error) {
        throw new Error(result.error)
      }
      
      await router.push('/profile')
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'خطا در ورود به سیستم'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await auth.signOut({ redirect: false })
      await router.push('/login')
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'خطا در خروج از سیستم'
      return false
    }
  }

  return {
    user,
    isAdmin,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout
  }
}