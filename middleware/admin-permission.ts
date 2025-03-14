import { useAdminAuth } from '~/composables/useAdminAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  const { checkPermission, checkModuleAccess, initialize } = useAdminAuth()
  
  // Initialize admin auth
  await initialize()

  // Check if route requires specific permission
  const requiredPermission = to.meta.permission as string
  if (requiredPermission && !checkPermission(requiredPermission)) {
    return navigateTo('/admin/unauthorized')
  }

  // Check if route requires specific module access
  const requiredModule = to.meta.module as string
  if (requiredModule && !checkModuleAccess(requiredModule)) {
    return navigateTo('/admin/unauthorized')
  }
}) 