<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
    <div class="max-w-md w-full mx-auto">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="text-center">
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            دسترسی غیرمجاز
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            شما مجوز دسترسی به این بخش را ندارید.
          </p>
        </div>
        
        <div class="mt-6">
          <div class="flex justify-center">
            <button
              @click="$router.push('/')"
              class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              بازگشت به صفحه اصلی
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})
</script> 