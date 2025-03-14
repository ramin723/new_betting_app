<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 class="text-3xl font-bold text-gray-900">پنل مدیریت</h1>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div class="py-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AdminStatsCard
              v-for="item in stats"
              :key="item.title"
              v-bind="item"
            />
          </div>
        </div>
      </div>

      <!-- بخش آمار کلی -->
      <div class="mt-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">آمار کلی سیستم</h2>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- نمودار درآمد -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-medium text-gray-900 mb-4">درآمد ماهانه</h3>
              <div class="h-64 flex items-center justify-center text-gray-500">
                [نمودار درآمد]
              </div>
            </div>

            <!-- نمودار کاربران -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-medium text-gray-900 mb-4">رشد کاربران</h3>
              <div class="h-64 flex items-center justify-center text-gray-500">
                [نمودار کاربران]
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- بخش فعالیت‌های اخیر -->
      <div class="mt-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">فعالیت‌های اخیر</h2>
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <ul class="divide-y divide-gray-200">
            <li v-for="(activity, index) in recentActivities" :key="index" class="p-4 hover:bg-gray-50">
              <div class="flex items-center space-x-4 rtl:space-x-reverse">
                <div class="flex-shrink-0">
                  <component :is="activity.icon" class="h-6 w-6 text-gray-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ activity.title }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ activity.description }}
                  </p>
                </div>
                <div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="activity.statusClass">
                    {{ activity.time }}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HomeIcon, UserGroupIcon, CalendarIcon, CurrencyDollarIcon, UserIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

const stats = [
  {
    title: 'کل کاربران',
    value: '1,234',
    icon: UserGroupIcon
  },
  {
    title: 'رویدادهای فعال',
    value: '12',
    icon: CalendarIcon
  },
  {
    title: 'درآمد کل',
    value: '۱۲,۳۴۵,۰۰۰ تومان',
    icon: CurrencyDollarIcon
  }
]

const recentActivities = [
  {
    icon: UserIcon,
    title: 'ثبت‌نام کاربر جدید',
    description: 'علی محمدی در سیستم ثبت‌نام کرد',
    time: '5 دقیقه پیش',
    statusClass: 'bg-green-100 text-green-800'
  },
  {
    icon: CalendarIcon,
    title: 'رویداد جدید',
    description: 'رویداد "مسابقه فوتبال" ایجاد شد',
    time: '1 ساعت پیش',
    statusClass: 'bg-blue-100 text-blue-800'
  },
  {
    icon: CurrencyDollarIcon,
    title: 'تراکنش موفق',
    description: 'پرداخت ۵۰۰,۰۰۰ تومان توسط کاربر رضا کریمی',
    time: '2 ساعت پیش',
    statusClass: 'bg-yellow-100 text-yellow-800'
  }
]
</script> 