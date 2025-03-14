import { computed } from 'vue'
import { HomeIcon, CalendarIcon, UserGroupIcon, ChartBarIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'
import { useAdminAuth } from './useAdminAuth'

export const useAdminNavigation = () => {
  const navigation = [
    {
      name: 'داشبورد',
      icon: HomeIcon,
      path: '/admin',
      permission: 'view_dashboard'
    },
    {
      name: 'مدیریت رویدادها',
      icon: CalendarIcon,
      path: '/admin/events',
      permission: 'manage_events'
    },
    {
      name: 'مدیریت کاربران',
      icon: UserGroupIcon,
      path: '/admin/users',
      permission: 'manage_users'
    },
    {
      name: 'آمار و گزارشات',
      icon: ChartBarIcon,
      path: '/admin/stats',
      permission: 'view_stats'
    },
    {
      name: 'تنظیمات',
      icon: Cog6ToothIcon,
      path: '/admin/settings',
      permission: 'manage_settings'
    }
  ]

  const { checkPermission } = useAdminAuth()
  
  const filteredNavigation = computed(() => {
    return navigation.filter(item => checkPermission(item.permission))
  })

  return {
    navigation: filteredNavigation
  }
} 