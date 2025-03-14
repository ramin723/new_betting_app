<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">مدیریت رویدادها</h1>
          <NuxtLink
            to="/admin/events/create"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            ایجاد رویداد جدید
          </NuxtLink>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div class="mt-8 flex flex-col">
          <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table class="min-w-full divide-y divide-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6">نام رویداد</th>
                      <th scope="col" class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">تاریخ</th>
                      <th scope="col" class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">وضعیت</th>
                      <th scope="col" class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">شرکت‌کنندگان</th>
                      <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span class="sr-only">عملیات</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="event in events" :key="event.id">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {{ event.title }}
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {{ new Date(event.date).toLocaleDateString('fa-IR') }}
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          :class="[
                            event.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                            'inline-flex rounded-full px-2 text-xs font-semibold leading-5'
                          ]"
                        >
                          {{ event.status === 'active' ? 'فعال' : 'غیرفعال' }}
                        </span>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {{ event.participants_count || 0 }}
                      </td>
                      <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-6">
                        <NuxtLink
                          :to="`/admin/events/${event.id}/edit`"
                          class="text-indigo-600 hover:text-indigo-900 ml-4"
                        >
                          ویرایش
                        </NuxtLink>
                        <button
                          @click="deleteEvent(event.id)"
                          class="text-red-600 hover:text-red-900"
                        >
                          حذف
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
import type { Event } from '~/types/admin'

definePageMeta({
  middleware: ['auth', 'admin']
})

const events = ref<Event[]>([])

// TODO: دریافت لیست رویدادها از API
onMounted(async () => {
  // این قسمت باید با API واقعی جایگزین شود
  events.value = [
    {
      id: 1,
      title: 'مسابقه فوتبال',
      description: 'مسابقه دوستانه بین دو تیم',
      date: '2024-03-20',
      status: 'active',
      participants_count: 10
    },
    // ... سایر رویدادها
  ]
})

const deleteEvent = async (id: number) => {
  if (confirm('آیا از حذف این رویداد اطمینان دارید؟')) {
    // TODO: ارسال درخواست حذف به API
    events.value = events.value.filter(event => event.id !== id)
  }
}
</script> 