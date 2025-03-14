<template>
  <div class="container mx-auto px-4 py-8">
    <div class="space-y-8">
      <!-- اطلاعات کلی کاربر -->
      <UserStats :user-stats="userStats" />

      <!-- تب‌های پروفایل -->
      <div class="bg-white rounded-lg shadow">
        <div class="border-b">
          <nav class="flex">
            <button v-for="tab in tabs" 
                    :key="tab.value"
                    :class="[
                      'px-6 py-4 text-sm font-medium border-b-2 -mb-px',
                      activeTab === tab.value
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    ]"
                    @click="activeTab = tab.value">
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- محتوای تب‌ها -->
        <div class="p-6">
          <!-- رویدادها -->
          <UserEvents v-if="activeTab === 'events'"
                     :events="events"
                     :current-page="currentPage"
                     :total-pages="totalPages"
                     @change-page="loadEvents"
                     @create-event="navigateToCreateEvent"
                     @view-event="navigateToEvent"
                     @edit-event="navigateToEditEvent" />

          <!-- ارجاع‌ها -->
          <UserReferrals v-if="activeTab === 'referrals'"
                        :referral-code="userStats.referral_code"
                        :referral-stats="referralStats"
                        :referrals="referrals"
                        :current-page="currentPage"
                        :total-pages="totalPages"
                        @change-page="loadReferrals" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import UserStats from '~/components/profile/UserStats.vue';
import UserEvents from '~/components/profile/UserEvents.vue';
import UserReferrals from '~/components/profile/UserReferrals.vue';

const router = useRouter();

// تب‌ها
const tabs = [
  { label: 'رویدادهای من', value: 'events' },
  { label: 'ارجاع‌های من', value: 'referrals' }
];
const activeTab = ref('events');

// پارامترهای صفحه‌بندی
const currentPage = ref(1);
const totalPages = ref(1);

// داده‌های کاربر
const userStats = ref({
  balance: 0,
  total_commission: 0,
  pending_commission: 0,
  total_events: 0,
  active_events: 0,
  referral_code: ''
});

// داده‌های رویدادها
const events = ref([]);
const loadEvents = async (page = 1) => {
  try {
    currentPage.value = page;
    const response = await fetch(`/api/users/events?page=${page}`);
    const data = await response.json();
    events.value = data.events;
    totalPages.value = data.total_pages;
  } catch (error) {
    console.error('خطا در دریافت رویدادها:', error);
  }
};

// داده‌های ارجاع‌ها
const referrals = ref([]);
const referralStats = ref({
  total_referrals: 0,
  total_bets: 0,
  total_bet_amount: 0,
  total_commission: 0,
  pending_commission: 0
});

const loadReferrals = async (page = 1) => {
  try {
    currentPage.value = page;
    const response = await fetch(`/api/users/referrals?page=${page}`);
    const data = await response.json();
    referrals.value = data.referrals;
    referralStats.value = data.stats;
    totalPages.value = data.total_pages;
  } catch (error) {
    console.error('خطا در دریافت ارجاع‌ها:', error);
  }
};

// دریافت اطلاعات اولیه
const loadUserStats = async () => {
  try {
    const response = await fetch('/api/users/stats');
    const data = await response.json();
    userStats.value = data;
  } catch (error) {
    console.error('خطا در دریافت آمار کاربر:', error);
  }
};

// توابع مسیریابی
const navigateToCreateEvent = () => {
  router.push('/events/create');
};

const navigateToEvent = (eventId) => {
  router.push(`/events/${eventId}`);
};

const navigateToEditEvent = (eventId) => {
  router.push(`/events/${eventId}/edit`);
};

// بارگذاری اولیه
onMounted(async () => {
  await Promise.all([
    loadUserStats(),
    loadEvents()
  ]);
});

// واکنش به تغییر تب
watch(activeTab, (newTab) => {
  currentPage.value = 1;
  if (newTab === 'events') {
    loadEvents();
  } else if (newTab === 'referrals') {
    loadReferrals();
  }
});
</script> 