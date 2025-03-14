<template>
  <div class="bg-white rounded-lg shadow-lg p-4">
    <h3 class="text-lg font-bold mb-4">آمار شرط‌بندی‌ها</h3>

    <!-- نمایش گزینه‌ها -->
    <div class="space-y-4">
      <div 
        v-for="option in options" 
        :key="option.id"
        class="relative"
      >
        <div class="flex justify-between mb-1">
          <span class="text-sm font-medium">{{ option.text }}</span>
          <span class="text-sm text-gray-600">
            {{ formatPercentage(option.percentage) }}%
          </span>
        </div>

        <!-- نوار پیشرفت -->
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            class="h-full bg-blue-500 transition-all duration-500"
            :style="{ width: option.percentage + '%' }"
          ></div>
        </div>

        <!-- اطلاعات اضافی -->
        <div class="flex justify-between mt-1 text-xs text-gray-500">
          <span>ضریب: {{ option.odds }}x</span>
          <span>{{ option.total_bets }} شرط</span>
        </div>
      </div>
    </div>

    <!-- آمار کلی -->
    <div class="mt-6 pt-4 border-t">
      <div class="grid grid-cols-2 gap-4">
        <div class="text-center">
          <span class="block text-2xl font-bold text-blue-600">
            {{ formatNumber(totalPool) }}
          </span>
          <span class="text-sm text-gray-600">مجموع شرط‌ها</span>
        </div>
        <div class="text-center">
          <span class="block text-2xl font-bold text-green-600">
            {{ formatNumber(potentialWin) }}
          </span>
          <span class="text-sm text-gray-600">برد احتمالی</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  options: {
    type: Array,
    required: true
  },
  totalPool: {
    type: Number,
    default: 0
  }
});

// محاسبه درصد هر گزینه
const calculatePercentages = (options) => {
  const total = options.reduce((sum, option) => sum + option.total_bets, 0);
  return options.map(option => ({
    ...option,
    percentage: total > 0 ? (option.total_bets / total) * 100 : 0
  }));
};

// محاسبه برد احتمالی
const potentialWin = computed(() => {
  // این مقدار باید بر اساس مبلغ شرط‌بندی کاربر و ضریب گزینه انتخابی محاسبه شود
  return 0;
});

// توابع فرمت‌کننده
const formatPercentage = (value) => {
  return Math.round(value * 10) / 10;
};

const formatNumber = (value) => {
  return new Intl.NumberFormat('fa-IR').format(value);
};
</script> 