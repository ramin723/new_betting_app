<template>
  <div class="max-w-2xl mx-auto p-6">
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold mb-6">Security Settings</h2>

      <!-- Password Change -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4">Change Password</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              v-model="currentPassword"
              type="password"
              class="w-full px-4 py-2 border rounded"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              v-model="newPassword"
              type="password"
              class="w-full px-4 py-2 border rounded"
            />
            <p class="text-sm text-gray-500 mt-1">
              Password must be at least 12 characters long and include uppercase, lowercase, numbers, and special characters.
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              class="w-full px-4 py-2 border rounded"
            />
          </div>
          <button
            @click="changePassword"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Change Password
          </button>
        </div>
      </div>

      <!-- Session Management -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4">Session Management</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium">Active Sessions</h4>
              <p class="text-sm text-gray-600">
                You are currently logged in on {{ activeSessions }} device(s)
              </p>
            </div>
            <button
              @click="terminateAllSessions"
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Terminate All Sessions
            </button>
          </div>
        </div>
      </div>

      <!-- Login History -->
      <div>
        <h3 class="text-lg font-semibold mb-4">Login History</h3>
        <div class="space-y-2">
          <div
            v-for="(login, index) in loginHistory"
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 rounded"
          >
            <div>
              <p class="font-medium">{{ login.ip_address }}</p>
              <p class="text-sm text-gray-600">{{ formatDate(new Date(login.created_at)) }}</p>
            </div>
            <span
              :class="{
                'text-green-600': login.success,
                'text-red-600': !login.success
              }"
            >
              {{ login.success ? 'Successful' : 'Failed' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminAuth } from '~/composables/useAdminAuth'
import type { LoginHistory } from '~/types/admin'

definePageMeta({
  middleware: ['auth', 'admin'],
  meta: {
    permission: 'manage_own_profile'
  }
})

const { $supabase } = useNuxtApp()
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const activeSessions = ref(1)
const loginHistory = ref<LoginHistory[]>([])

const fetchLoginHistory = async () => {
  try {
    const { data, error } = await $supabase
      .from('login_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    loginHistory.value = data
  } catch (error) {
    console.error('Error fetching login history:', error)
  }
}

onMounted(async () => {
  await fetchLoginHistory()
})

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    // Show error message
    return
  }

  try {
    const { error } = await $supabase.auth.updateUser({
      password: newPassword.value
    })

    if (error) throw error

    // Show success message
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    console.error('Error changing password:', error)
    // Show error message
  }
}

const terminateAllSessions = async () => {
  try {
    const { error } = await $supabase.auth.signOut()
    if (error) throw error
    // Redirect to login page
  } catch (error) {
    console.error('Error terminating sessions:', error)
    // Show error message
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}
</script> 