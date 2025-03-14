export default defineNuxtRouteMiddleware(async (to) => {
  console.log('🔵 Auth middleware checking path:', to.path);

  // صفحاتی که نیاز به احراز هویت دارند
  const protectedPages = ['/dashboard', '/profile', '/wallet'];
  const protectedApiPaths = [
    '/api/users',
    '/api/profile',
    '/api/events/create',
    '/api/bets',
    '/api/wallet'
  ];

  const authRequired = protectedPages.includes(to.path) || 
    protectedApiPaths.some(path => to.path.startsWith(path));
  console.log('🟡 Auth required:', authRequired);

  // صفحاتی که فقط برای کاربران مهمان قابل دسترس هستند
  const guestPages = ['/login', '/register'];
  const guestOnly = guestPages.includes(to.path);
  console.log('🟡 Guest only page:', guestOnly);

  // مسیرهای عمومی API
  const publicApiPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/me'];
  const isPublicApi = publicApiPaths.some(path => to.path.startsWith(path));
  
  if (isPublicApi) {
    console.log('🟢 Public API path, allowing access');
    return;
  }

  // بررسی وضعیت لاگین
  const auth = useAuth();
  console.log('🟡 Checking auth status for path:', to.path);
  const isAuthenticated = await auth.checkAuth();
  console.log('🟡 Is authenticated:', isAuthenticated);

  // اگر صفحه نیاز به احراز هویت دارد و کاربر لاگین نکرده است
  if (authRequired && !isAuthenticated) {
    console.log('🔴 Protected page, redirecting to login');
    return navigateTo('/login');
  }

  // اگر صفحه مخصوص مهمان است و کاربر لاگین کرده است
  if (guestOnly && isAuthenticated) {
    console.log('🟢 Guest page but user is authenticated, redirecting to profile');
    return navigateTo('/profile');
  }

  console.log('🟢 Auth middleware completed');
}); 