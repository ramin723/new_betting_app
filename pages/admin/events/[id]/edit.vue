<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 class="text-3xl font-bold text-gray-900">ویرایش رویداد</h1>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div class="mt-8">
          <div class="md:grid md:grid-cols-3 md:gap-6">
            <div class="md:col-span-1">
              <div class="px-4 sm:px-0">
                <h3 class="text-lg font-medium leading-6 text-gray-900">اطلاعات رویداد</h3>
                <p class="mt-1 text-sm text-gray-600">
                  لطفاً اطلاعات رویداد را ویرایش کنید.
                </p>
              </div>
            </div>
            <div class="mt-5 md:mt-0 md:col-span-2">
              <form @submit.prevent="handleSubmit" v-if="event">
                <div class="shadow sm:rounded-md sm:overflow-hidden">
                  <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div>
                      <label for="title" class="block text-sm font-medium text-gray-700">عنوان رویداد</label>
                      <input
                        type="text"
                        v-model="form.title"
                        id="title"
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label for="description" class="block text-sm font-medium text-gray-700">توضیحات</label>
                      <textarea
                        v-model="form.description"
                        id="description"
                        rows="3"
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      ></textarea>
                    </div>

                    <div>
                      <label for="date" class="block text-sm font-medium text-gray-700">تاریخ رویداد</label>
                      <input
                        type="datetime-local"
                        v-model="form.date"
                        id="date"
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label for="status" class="block text-sm font-medium text-gray-700">وضعیت</label>
                      <select
                        v-model="form.status"
                        id="status"
                        class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="draft">پیش‌نویس</option>
                        <option value="active">فعال</option>
                        <option value="completed">تکمیل شده</option>
                      </select>
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
import type { Event } from '~/types/admin'

definePageMeta({
  middleware: ['auth', 'admin']
})

const route = useRoute()
const event = ref<Event | null>(null)
const form = ref<Omit<Event, 'id' | 'participants_count'>>({
  title: '',
  description: '',
  date: '',
  status: 'draft'
})

// دریافت اطلاعات رویداد
onMounted(async () => {
  try {
    // TODO: دریافت اطلاعات رویداد از API
    // این یک داده نمونه است
    event.value = {
      id: Number(route.params.id),
      title: 'مسابقه فوتبال',
      description: 'مسابقه دوستانه',
      date: '2024-03-20T15:00',
      status: 'active',
      participants_count: 0
    }
    
    // پر کردن فرم با داده‌های رویداد
    form.value = {
      title: event.value.title,
      description: event.value.description,
      date: event.value.date,
      status: event.value.status
    }
  } catch (error) {
    console.error('Error fetching event:', error)
  }
})

const handleSubmit = async () => {
  try {
    // TODO: ارسال تغییرات به API
    console.log('Form submitted:', form.value)
    // بعد از موفقیت، به صفحه لیست رویدادها هدایت می‌شویم
    navigateTo('/admin/events')
  } catch (error) {
    console.error('Error submitting form:', error)
  }
}
</script> 