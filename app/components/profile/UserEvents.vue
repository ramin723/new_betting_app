<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">رویدادهای من</h2>
      <div class="flex gap-2">
        <select v-model="filter" class="rounded-lg border p-2 text-sm">
          <option value="all">همه</option>
          <option value="active">فعال</option>
          <option value="pending">در انتظار نتیجه</option>
          <option value="closed">بسته شده</option>
        </select>
        <button class="btn-primary" @click="$emit('create-event')">
          ایجاد رویداد جدید
        </button>
      </div>
    </div>

    <!-- لیست رویدادها -->
    <div class="space-y-4">
      <div v-for="event in filteredEvents" :key="event.id" 
           class="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-semibold text-lg">{{ event.title }}</h3>
            <p class="text-gray-600 text-sm mt-1">{{ event.question }}</p>
          </div>
          <div :class="getStatusClass(event.status)" class="px-3 py-1 rounded-full text-sm">
            {{ getStatusText(event.status) }}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <div class="text-gray-600 text-sm">کل شرط‌ها</div>
            <div class="font-semibold">
              {{ formatNumber(event.total_bets) }} شرط
              ({{ formatNumber(event.total_amount) }} تومان)
            </div>
          </div>
          <div>
            <div class="text-gray-600 text-sm">کمیسیون</div>
            <div class="font-semibold text-green-600">
              {{ formatNumber(event.commission) }} تومان
              <span v-if="event.pending_commission" class="text-sm text-gray-500">
                ({{ formatNumber(event.pending_commission) }} تومان در انتظار)
              </span>
            </div>
          </div>
          <div>
            <div class="text-gray-600 text-sm">مهلت شرط‌بندی</div>
            <div class="font-semibold">
              {{ formatDate(event.betting_deadline) }}
            </div>
          </div>
        </div>

        <div class="flex gap-2 mt-4">
          <button class="btn-secondary text-sm" @click="$emit('view-event', event.id)">
            مشاهده جزئیات
          </button>
          <button v-if="event.status === 'active'" 
                  class="btn-outline text-sm" 
                  @click="$emit('edit-event', event.id)">
            ویرایش
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-6">
      <button v-for="page in totalPages" 
              :key="page"
              :class="[
                'px-3 py-1 rounded',
                currentPage === page ? 'bg-primary text-white' : 'bg-gray-100'
              ]"
              @click="$emit('change-page', page)">
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  events: {
    type: Array,
    required: true
  },
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    default: 1
  }
});

const filter = ref('all');

const filteredEvents = computed(() => {
  if (filter.value === 'all') return props.events;
  return props.events.filter(event => event.status === filter.value);
});

const getStatusClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-gray-100 text-gray-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (status) => {
  const texts = {
    active: 'فعال',
    pending: 'در انتظار نتیجه',
    closed: 'بسته شده'
  };
  return texts[status] || status;
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('fa-IR').format(num);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script> 