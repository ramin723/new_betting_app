import { useAdminAuth } from '~/composables/useAdminAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, initialize } = useAdminAuth()
  
  try {
    await initialize()
    
    // اگر کاربر وجود ندارد یا ادمین نیست
    if (!user.value || user.value.role !== 'admin') {
      console.log('🔴 Access denied: User is not admin')
      return navigateTo('/unauthorized')
    }
    
    console.log('🟢 Admin access granted')
  } catch (error) {
    console.error('🔴 Error in admin middleware:', error)
    return navigateTo('/unauthorized')
  }
}) 