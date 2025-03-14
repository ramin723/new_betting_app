<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-2xl font-bold mb-4">آمار کلی</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- موجودی -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="text-gray-600 text-sm">موجودی حساب</div>
        <div class="text-2xl font-bold text-primary">
          {{ formatNumber(userStats.balance) }} تومان
        </div>
      </div>
      
      <!-- کمیسیون کل -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="text-gray-600 text-sm">کل کمیسیون‌ها</div>
        <div class="flex items-end gap-2">
          <div class="text-2xl font-bold text-green-600">
            {{ formatNumber(userStats.total_commission) }} تومان
          </div>
          <div class="text-sm text-gray-500 mb-1">
            ({{ userStats.pending_commission }} تومان در انتظار)
          </div>
        </div>
      </div>

      <!-- تعداد رویدادها -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="text-gray-600 text-sm">رویدادهای ایجاد شده</div>
        <div class="flex items-end gap-2">
          <div class="text-2xl font-bold text-blue-600">{{ userStats.total_events }}</div>
          <div class="text-sm text-gray-500 mb-1">
            ({{ userStats.active_events }} فعال)
          </div>
        </div>
      </div>
    </div>

    <!-- نمودار فعالیت -->
    <div class="mt-6">
      <h3 class="text-lg font-semibold mb-2">فعالیت اخیر</h3>
      <div class="h-48 bg-gray-50 rounded-lg p-4">
        <!-- اینجا می‌تونیم یه نمودار خطی از فعالیت‌های اخیر بذاریم -->
        <!-- از کتابخونه‌هایی مثل Chart.js یا ApexCharts استفاده می‌کنیم -->
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  userStats: {
    type: Object,
    required: true
  }
});

const formatNumber = (num) => {
  return new Intl.NumberFormat('fa-IR').format(num);
};
</script> 