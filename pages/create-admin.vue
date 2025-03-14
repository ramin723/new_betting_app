<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <h2 class="text-2xl font-bold text-center mb-6">ایجاد کاربر ادمین</h2>
      
      <div v-if="error" class="mb-4 p-4 bg-red-100 text-red-700 rounded">
        {{ error }}
      </div>
      
      <div v-if="success" class="mb-4 p-4 bg-green-100 text-green-700 rounded">
        {{ success }}
      </div>

      <form @submit.prevent="createAdmin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">نام کاربری</label>
          <input
            v-model="form.username"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">ایمیل</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">رمز عبور</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <span v-if="loading">در حال پردازش...</span>
          <span v-else>ایجاد ادمین</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const form = reactive({
  username: '',
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

async function createAdmin() {
  try {
    loading.value = true
    error.value = ''
    success.value = ''

    const response = await $fetch('/api/auth/create-admin', {
      method: 'POST',
      body: form
    })

    success.value = response.message
    form.username = ''
    form.email = ''
    form.password = ''
  } catch (err: any) {
    error.value = err.data?.message || 'خطایی رخ داد'
  } finally {
    loading.value = false
  }
}
</script> 