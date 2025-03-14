import { useAdminAuth } from '~/composables/useAdminAuth'

export default defineNuxtRouteMiddleware((to) => {
  const { checkPermission, checkModuleAccess } = useAdminAuth()
  
  // Skip middleware for non-admin routes
  if (!to.path.startsWith('/admin')) {
    return
  }

  // Check if user has required permissions
  const requiredPermission = to.meta.permission as string
  const requiredModule = to.meta.module as string

  if (requiredPermission && !checkPermission(requiredPermission)) {
    return navigateTo('/admin/unauthorized')
  }

  if (requiredModule && !checkModuleAccess(requiredModule)) {
    return navigateTo('/admin/unauthorized')
  }
}) 