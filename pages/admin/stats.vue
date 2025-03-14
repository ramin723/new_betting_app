<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 class="text-3xl font-bold text-gray-900">آمار و گزارشات</h1>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div class="mt-8">
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <!-- کارت تعداد کل کاربران -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">تعداد کل کاربران</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ stats.totalUsers }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <!-- کارت تعداد رویدادهای فعال -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">رویدادهای فعال</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ stats.activeEvents }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <!-- کارت حجم کل معاملات -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">حجم کل معاملات</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ stats.totalTransactions }} تومان</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- نمودار معاملات روزانه -->
          <div class="mt-8">
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">معاملات روزانه</h3>
              <div class="h-64">
                <!-- TODO: اضافه کردن نمودار -->
                <p class="text-gray-500 text-center">نمودار معاملات روزانه</p>
              </div>
            </div>
          </div>

          <!-- جدول آخرین معاملات -->
          <div class="mt-8">
            <div class="bg-white shadow rounded-lg">
              <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg font-medium text-gray-900">آخرین معاملات</h3>
              </div>
              <div class="border-t border-gray-200">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">کاربر</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رویداد</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مبلغ</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاریخ</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="transaction in recentTransactions" :key="transaction.id">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {{ transaction.user }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ transaction.event }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ transaction.amount }} تومان
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ new Date(transaction.date).toLocaleDateString('fa-IR') }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Stats, Transaction } from '~/types/admin'

definePageMeta({
  middleware: ['auth', 'admin']
})

const stats = ref<Stats>({
  totalUsers: 0,
  activeEvents: 0,
  totalTransactions: 0,
  dailyTransactions: []
})

const recentTransactions = ref<Transaction[]>([])

// دریافت آمار و گزارشات
onMounted(async () => {
  try {
    // TODO: دریافت آمار از API
    // این داده‌های نمونه هستند
    stats.value = {
      totalUsers: 150,
      activeEvents: 25,
      totalTransactions: 15000000,
      dailyTransactions: [
        {
          date: '2024-03-20',
          amount: 1000000
        },
        {
          date: '2024-03-19',
          amount: 800000
        }
      ]
    }

    recentTransactions.value = [
      {
        id: 1,
        user: 'user1',
        event: 'مسابقه فوتبال',
        amount: 100000,
        date: '2024-03-20'
      },
      {
        id: 2,
        user: 'user2',
        event: 'مسابقه والیبال',
        amount: 50000,
        date: '2024-03-19'
      }
    ]
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
})
</script> 