<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 class="text-3xl font-bold text-gray-900">ویرایش کاربر</h1>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div class="mt-8">
          <div class="md:grid md:grid-cols-3 md:gap-6">
            <div class="md:col-span-1">
              <div class="px-4 sm:px-0">
                <h3 class="text-lg font-medium leading-6 text-gray-900">اطلاعات کاربر</h3>
                <p class="mt-1 text-sm text-gray-600">
                  لطفاً اطلاعات کاربر را ویرایش کنید.
                </p>
              </div>
            </div>
            <div class="mt-5 md:mt-0 md:col-span-2">
              <form @submit.prevent="handleSubmit" v-if="user">
                <div class="shadow sm:rounded-md sm:overflow-hidden">
                  <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div>
                      <label for="username" class="block text-sm font-medium text-gray-700">نام کاربری</label>
                      <input
                        type="text"
                        v-model="form.username"
                        id="username"
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label for="email" class="block text-sm font-medium text-gray-700">ایمیل</label>
                      <input
                        type="email"
                        v-model="form.email"
                        id="email"
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label for="role" class="block text-sm font-medium text-gray-700">نقش</label>
                      <select
                        v-model="form.role"
                        id="role"
                        class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="user">کاربر</option>
                        <option value="admin">ادمین</option>
                      </select>
                    </div>

                    <div>
                      <label for="balance" class="block text-sm font-medium text-gray-700">موجودی (تومان)</label>
                      <input
                        type="number"
                        v-model="form.balance"
                        id="balance"
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        v-model="form.is_active"
                        id="is_active"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label for="is_active" class="mr-2 block text-sm text-gray-900">
                        فعال
                      </label>
                    </div>
                  </div>
                  <div class="px-4 py-3 bg-gray-50 text-left sm:px-6">
                    <button
                      type="submit"
                      class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      ذخیره تغییرات
                    </button>
                  </div>
                </div>
              </form>
              <div v-else class="text-center py-12">
                <p class="text-gray-500">در حال بارگذاری...</p>
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

const route = useRoute()
const user = ref<ExtendedUser | null>(null)
const form = ref<Omit<ExtendedUser, 'id' | 'created_at' | 'updated_at' | 'aud' | 'app_metadata' | 'user_metadata'>>({
  username: '',
  email: '',
  role: 'user',
  balance: 0,
  is_active: true
})

// دریافت اطلاعات کاربر
onMounted(async () => {
  try {
    const response = await fetch(`/api/users/${route.params.id}`)
    const data = await response.json()
    
    if (data.success && data.user) {
      user.value = data.user
      // پر کردن فرم با داده‌های کاربر
      if (user.value) {
        form.value = {
          username: user.value.username,
          email: user.value.email,
          role: user.value.role,
          balance: user.value.balance,
          is_active: user.value.is_active
        }
      }
    }
  } catch (error) {
    console.error('Error fetching user:', error)
  }
})

const handleSubmit = async () => {
  try {
    // TODO: ارسال تغییرات به API
    console.log('Form submitted:', form.value)
    // بعد از موفقیت، به صفحه لیست کاربران هدایت می‌شویم
    navigateTo('/admin/users')
  } catch (error) {
    console.error('Error submitting form:', error)
  }
}
</script> 