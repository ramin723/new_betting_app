<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <img class="h-8 w-auto" src="~/assets/logo.svg" alt="Logo" />
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NuxtLink
                v-for="item in navigation"
                :key="item.path"
                :to="item.path"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-indigo-500 text-gray-900"
              >
                <component :is="item.icon" class="h-5 w-5 ml-2" />
                {{ item.name }}
              </NuxtLink>
            </div>
          </div>
          <div class="flex items-center">
            <div class="ml-4 flex items-center md:ml-6">
              <!-- Profile dropdown -->
              <div class="ml-3 relative">
                <div>
                  <button
                    type="button"
                    class="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    id="user-menu-button"
                    @click="isProfileOpen = !isProfileOpen"
                  >
                    <span class="sr-only">باز کردن منوی کاربر</span>
                    <img
                      class="h-8 w-8 rounded-full"
                      :src="userAvatar"
                      alt=""
                    />
                  </button>
                </div>
                <div
                  v-if="isProfileOpen"
                  class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                >
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    @click="logout"
                  >
                    خروج
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAdminNavigation } from '~/composables/useAdminNavigation'
import { useAdminAuth } from '~/composables/useAdminAuth'
import { md5 } from '~/utils/md5'

const { navigation } = useAdminNavigation()
const { user, logout } = useAdminAuth()

const isProfileOpen = ref(false)

const userAvatar = computed(() => {
  // استفاده از gravatar با ایمیل کاربر
  const email = user.value?.email || ''
  const hash = email ? md5(email.toLowerCase().trim()) : ''
  return `https://www.gravatar.com/avatar/${hash}?d=mp`
})
</script> 