<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">ارجاع‌های من</h2>
      <button class="btn-primary" @click="copyReferralCode">
        کد ارجاع: {{ referralCode }}
        <span class="text-sm opacity-75">(کلیک برای کپی)</span>
      </button>
    </div>

    <!-- آمار کلی ارجاع‌ها -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="text-gray-600 text-sm">تعداد کل ارجاع‌ها</div>
        <div class="text-2xl font-bold text-primary">
          {{ formatNumber(referralStats.total_referrals) }}
        </div>
      </div>
      
      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="text-gray-600 text-sm">مجموع شرط‌های ارجاعی</div>
        <div class="text-2xl font-bold text-blue-600">
          {{ formatNumber(referralStats.total_bets) }}
          <span class="text-sm text-gray-500">
            ({{ formatNumber(referralStats.total_bet_amount) }} تومان)
          </span>
        </div>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg">
        <div class="text-gray-600 text-sm">کمیسیون ارجاع</div>
        <div class="text-2xl font-bold text-green-600">
          {{ formatNumber(referralStats.total_commission) }} تومان
          <div class="text-sm text-gray-500">
            {{ formatNumber(referralStats.pending_commission) }} تومان در انتظار
          </div>
        </div>
      </div>
    </div>

    <!-- لیست رویدادهای ارجاعی -->
    <div class="mt-6">
      <h3 class="text-lg font-semibold mb-4">رویدادهای ارجاعی</h3>
      <div class="space-y-4">
        <div v-for="referral in referrals" :key="referral.id"
             class="border rounded-lg p-4">
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-semibold">{{ referral.event.title }}</h4>
              <p class="text-sm text-gray-600 mt-1">
                کد ارجاع: {{ referral.referral_code }}
              </p>
            </div>
            <div class="text-sm">
              {{ formatDate(referral.created_at) }}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <div class="text-gray-600 text-sm">تعداد شرط‌ها</div>
              <div class="font-semibold">
                {{ formatNumber(referral.total_bets) }} شرط
              </div>
            </div>
            <div>
              <div class="text-gray-600 text-sm">مجموع مبلغ</div>
              <div class="font-semibold">
                {{ formatNumber(referral.total_bet_amount) }} تومان
              </div>
            </div>
            <div>
              <div class="text-gray-600 text-sm">کمیسیون</div>
              <div class="font-semibold text-green-600">
                {{ formatNumber(referral.commission_stats.total) }} تومان
                <span v-if="referral.commission_stats.pending" class="text-sm text-gray-500">
                  ({{ formatNumber(referral.commission_stats.pending) }} تومان در انتظار)
                </span>
              </div>
            </div>
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
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  referralCode: {
    type: String,
    required: true
  },
  referralStats: {
    type: Object,
    required: true
  },
  referrals: {
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

const copyReferralCode = async () => {
  try {
    await navigator.clipboard.writeText(props.referralCode);
    // می‌توانیم یک نوتیفیکیشن نمایش دهیم
  } catch (err) {
    console.error('خطا در کپی کردن کد ارجاع:', err);
  }
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('fa-IR').format(num);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script> 