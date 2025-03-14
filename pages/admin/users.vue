<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 class="text-3xl font-bold text-gray-900">مدیریت کاربران</h1>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div class="mt-8 flex flex-col">
          <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table class="min-w-full divide-y divide-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6">نام کاربری</th>
                      <th scope="col" class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">ایمیل</th>
                      <th scope="col" class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">نقش</th>
                      <th scope="col" class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">موجودی</th>
                      <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span class="sr-only">عملیات</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="user in users" :key="user.id">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {{ user.username }}
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {{ user.email }}
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          :class="[
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800',
                            'inline-flex rounded-full px-2 text-xs font-semibold leading-5'
                          ]"
                        >
                          {{ user.role === 'admin' ? 'ادمین' : 'کاربر' }}
                        </span>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {{ user.balance }} تومان
                      </td>
                      <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-6">
                        <button
                          @click="editUser(user)"
                          class="text-indigo-600 hover:text-indigo-900 ml-4"
                        >
                          ویرایش
                        </button>
                        <button
                          @click="toggleUserStatus(user)"
                          class="text-red-600 hover:text-red-900"
                        >
                          {{ user.is_active ? 'غیرفعال' : 'فعال' }}
                        </button>
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
import type { ExtendedUser } from '~/types/admin'

definePageMeta({
  middleware: ['auth', 'admin']
})

const users = ref<ExtendedUser[]>([])

// دریافت لیست کاربران
onMounted(async () => {
  try {
    // TODO: دریافت لیست کاربران از API
    // این داده‌های نمونه هستند
    users.value = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        balance: 1000000,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: 'authenticated',
        app_metadata: {},
        user_metadata: {}
      },
      {
        id: '2',
        username: 'user1',
        email: 'user1@example.com',
        role: 'user',
        balance: 50000,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: 'authenticated',
        app_metadata: {},
        user_metadata: {}
      }
    ]
  } catch (error) {
    console.error('Error fetching users:', error)
  }
})

const editUser = (user: ExtendedUser) => {
  // TODO: انتقال به صفحه ویرایش کاربر
  console.log('Edit user:', user)
}

const toggleUserStatus = async (user: ExtendedUser) => {
  try {
    // TODO: ارسال درخواست تغییر وضعیت به API
    user.is_active = !user.is_active
  } catch (error) {
    console.error('Error toggling user status:', error)
  }
}
</script> 