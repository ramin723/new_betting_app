import { defineNuxtRouteMiddleware, navigateTo } from '#app'

// کاربر تست موقت برای توسعه
const TEST_USER = {
  id: 1,
  username: 'test_admin',
  email: 'admin@test.com',
  role: 'admin',
  points: 1000,
  created_at: new Date().toISOString()
}

export default defineNuxtRouteMiddleware(async (to) => {
  // در سمت سرور اجرا نشود
  if (import.meta.server) return

  const { checkAuth } = useAuth()
  const isAuthenticated = await checkAuth()

  // مسیرهای عمومی که نیاز به احراز هویت ندارند
  const publicRoutes = ['/login', '/register', '/api/auth/create-admin']
  const isPublicRoute = publicRoutes.includes(to.path)

  // اگر کاربر لاگین نکرده و مسیر عمومی نیست، به صفحه لاگین هدایت شود
  if (!isAuthenticated && !isPublicRoute) {
    console.log('🔴 [Auth Middleware] User not authenticated, redirecting to login')
    return navigateTo('/login')
  }

  // اگر کاربر لاگین کرده و به صفحه لاگین می‌رود، به صفحه پروفایل هدایت شود
  if (isAuthenticated && isPublicRoute) {
    console.log('🟡 [Auth Middleware] User already authenticated, redirecting to profile')
    return navigateTo('/profile')
  }
}) 