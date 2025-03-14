<template>
  <div class="container">
    <!-- هدر -->
    <header class="header">
      <div class="header-left">
        <button class="notifications-btn" @click="toggleNotifications">
          🔔
          <span v-if="notificationCount > 0" class="notifications-badge">{{ notificationCount }}</span>
        </button>
      </div>

      <div class="profile-section">
        <div class="profile-avatar">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" />
          <button class="points-icon" @click="togglePointsMenu" title="Points: {{ points.toLocaleString() }}">
            ⭐
          </button>
        </div>
      </div>

      <div class="header-right">
        <button class="connect-wallet-btn" @click="connectWallet">
          <span class="wallet-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 14C16 15.1046 16.8954 16 18 16C19.1046 16 20 15.1046 20 14C20 12.8954 19.1046 12 18 12C16.8954 12 16 12.8954 16 14Z" fill="currentColor"/>
              <path d="M3 7V7C3 5.89543 3.89543 5 5 5H16.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <span>Connect Wallet</span>
        </button>
      </div>
    </header>

    <!-- تب‌بندی دسته‌بندی‌ها -->
    <CategoryTabs 
      v-model:selectedCategory="selectedCategory"
      v-model:selectedSubTags="selectedSubTags"
    />

    <!-- لیست رویدادها -->
    <section class="events">
      <div v-if="eventsLoading" class="loading-state">
        <div class="spinner"></div>
        <p>در حال بارگذاری...</p>
      </div>
      <div v-else-if="eventsError" class="error-state">
        <p>خطا در دریافت رویدادها</p>
        <button @click="refreshEvents" class="retry-button">تلاش مجدد</button>
      </div>
      <template v-else>
        <div v-if="filteredEvents.length === 0" class="no-events">
          <p>رویدادی یافت نشد</p>
          <button @click="resetFilters" class="retry-button">نمایش همه رویدادها</button>
        </div>
        <div v-else class="events-grid">
          <EventCard v-for="event in filteredEvents" :key="event.id" :event="event" />
        </div>
      </template>
    </section>

    <!-- دکمه شناور -->
    <FloatingButton @click="router.push('/events/create')" />

    <!-- نوار پیمایش پایین -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import BottomNav from "@/components/BottomNav.vue";
import EventCard from "@/components/EventCard.vue";
import FloatingButton from "@/components/FloatingButton.vue";
import CategoryTabs from "@/components/CategoryTabs.vue";

const router = useRouter();

// وضعیت انتخاب دسته‌بندی
const selectedCategory = ref(null);
const selectedSubTags = ref([]);

// داده‌های تستی
const points = ref(8000);
const notificationCount = ref(1);

// دریافت رویدادها از API
const { data: eventsData, isLoading: eventsLoading, error: eventsError, refresh } = await useFetch('/api/events', {
  credentials: 'include',
  headers: {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  },
  transform: (response) => {
    console.log('Events API Response:', response);
    if (response.success && response.events) {
      const transformedEvents = response.events.map(event => {
        // اطمینان از وجود Tags
        const tags = event.Tags || [];
        return {
          ...event,
          // نگه داشتن آرایه Tags برای فیلتر کردن
          Tags: tags,
          // ساخت رشته نمایشی تگ‌ها
          displayTags: tags.map(tag => `#${tag.name}`).join(' '),
          // اضافه کردن مقادیر پیش‌فرض برای فیلدهای اختیاری
          image: event.image || null,
          participants: event.participants || 0,
          prize: event.total_pool || '0',
          time_left: calculateTimeLeft(event.end_time)
        };
      });
      console.log('Transformed Events:', transformedEvents);
      return transformedEvents;
    }
    return [];
  }
});

// دریافت تگ‌ها از API
const { data: tagsData, isLoading: tagsLoading, error: tagsError } = await useFetch('/api/tags', {
  credentials: 'include',
  headers: {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  },
  transform: (response) => {
    console.log('Tags API Response:', response);
    return response;
  }
});

// محاسبه زمان باقی‌مانده
function calculateTimeLeft(endTime) {
  if (!endTime) return '۰۰:۰۰:۰۰';
  const end = new Date(endTime);
  const now = new Date();
  const diff = end - now;
  
  if (diff <= 0) return 'پایان یافته';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours}:${minutes}:${seconds}`;
}

// فیلتر کردن رویدادها بر اساس دسته‌بندی و زیرشاخه‌های انتخاب شده
const filteredEvents = computed(() => {
  console.log('Filtering events. Selected category:', selectedCategory.value);
  console.log('Selected sub tags:', selectedSubTags.value);
  console.log('Available events:', eventsData.value);
  
  if (!eventsData.value) {
    console.log('No events data available');
    return [];
  }
  
  if (!selectedCategory.value) {
    console.log('No category selected, returning all events');
    return eventsData.value;
  }
  
  return eventsData.value.filter(event => {
    // اگر رویداد تگ ندارد، آن را نمایش نمی‌دهیم
    if (!event.Tags || !Array.isArray(event.Tags)) {
      console.log('Event has no tags:', event);
      return false;
    }
    
    // اگر زیرشاخه‌ای انتخاب شده باشد
    if (selectedSubTags.value.length > 0) {
      // رویداد باید حداقل یکی از زیرشاخه‌های انتخاب شده را داشته باشد
      return event.Tags.some(tag => selectedSubTags.value.includes(tag.id));
    }
    
    // اگر فقط دسته‌بندی اصلی انتخاب شده باشد
    return event.Tags.some(tag => tag.id === selectedCategory.value || tag.parent_id === selectedCategory.value);
  });
});

// مانیتور کردن تغییرات
watch([selectedCategory, selectedSubTags, eventsData], ([newCategory, newSubTags, newEvents]) => {
  console.log('Category changed to:', newCategory);
  console.log('Sub tags changed to:', newSubTags);
  console.log('Events data changed:', newEvents);
}, { immediate: true });

// تابع تلاش مجدد
const refreshEvents = async () => {
  await refresh();
};

// تابع ریست کردن فیلترها
const resetFilters = () => {
  selectedCategory.value = null;
  selectedSubTags.value = [];
};

// اضافه کردن تابع‌های جدید
const connectWallet = () => {
  // اینجا منتظر پیاده‌سازی اتصال به کیف پول
  console.log('Connecting wallet...');
};

const toggleNotifications = () => {
  // اینجا منتظر پیاده‌سازی نوتیفیکیشن‌ها
  console.log('Toggling notifications...');
};

const togglePointsMenu = () => {
  // اینجا منتظر پیاده‌سازی تغییر منوی نقاط
  console.log('Toggling points menu...');
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 8px;
  background-color: #A8DADC;
  min-height: 100vh;
}

.header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: linear-gradient(135deg, #1D3557, #457B9D);
  border-radius: 16px;
  margin-bottom: 60px;
  height: 100px;
  overflow: visible;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
}

.header-left, .header-right {
  position: relative;
  z-index: 2;
}

.notifications-btn {
  position: relative;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  font-size: 24px;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: white;
}

.notifications-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.notifications-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #E63946;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
  border: 2px solid #1D3557;
}

.profile-section {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.profile-avatar {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 4px solid #1D3557;
  background: #F1FAEE;
  overflow: visible;
  position: relative;
  box-shadow: 0 4px 20px rgba(29, 53, 87, 0.2);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.points-icon {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #E63946;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  border: 2px solid #1D3557;
  box-shadow: 0 4px 15px rgba(29, 53, 87, 0.25);
  transition: all 0.3s ease;
  transform-origin: center;
  z-index: 3;
}

.points-icon:hover {
  transform: scale(1.15) rotate(15deg);
  box-shadow: 0 6px 20px rgba(29, 53, 87, 0.35);
}

.points-icon:active {
  transform: scale(0.95);
}

@keyframes floatAnimation {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.points-icon {
  animation: floatAnimation 2s ease-in-out infinite;
}

.connect-wallet-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #E63946;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 120px;
  justify-content: center;
}

.connect-wallet-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 57, 70, 0.3);
  background: #c1121f;
}

.wallet-icon {
  display: flex;
  align-items: center;
  font-size: 20px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  font-size: 28px;
}

.app-name {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #1D3557, #457B9D);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: -0.5px;
}

.points-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(29, 53, 87, 0.05), rgba(69, 123, 157, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(29, 53, 87, 0.1);
}

.points-icon {
  font-size: 20px;
}

.points-info {
  display: flex;
  flex-direction: column;
}

.points-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.points-value {
  font-size: 16px;
  font-weight: 600;
  color: #1D3557;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.event-card {
  background: #F1FAEE;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(29, 53, 87, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #457B9D;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(29, 53, 87, 0.15);
}

.event-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background-color: #457B9D;
}

.event-content {
  padding: 1.5rem;
}

.event-title {
  font-size: 1.25rem;
  color: #1D3557;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.event-description {
  color: #457B9D;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.event-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: #457B9D;
  font-size: 0.9rem;
}

.event-options {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.option {
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  background: #F1FAEE;
  border: 1px solid #457B9D;
  color: #457B9D;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option:hover {
  background: #457B9D;
  color: #F1FAEE;
}

.option.selected {
  background: #E63946;
  color: #F1FAEE;
  border-color: #E63946;
}

.event-actions {
  display: flex;
  gap: 1rem;
}

.action-button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.bet-button {
  background: #E63946;
  color: #F1FAEE;
}

.bet-button:hover {
  background: #c1121f;
}

.details-button {
  background: #1D3557;
  color: #F1FAEE;
}

.details-button:hover {
  background: #162436;
}

.no-events {
  text-align: center;
  padding: 2rem;
  color: #457B9D;
  font-size: 1.2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #457B9D;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #E63946;
}

.reset-button {
  background: #1D3557;
  color: #F1FAEE;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  margin: 1rem 0;
}

.reset-button:hover {
  background: #162436;
}

@media (max-width: 768px) {
  .header {
    width: 95%;
    padding: 12px 20px;
    height: 80px;
    margin-bottom: 40px;
  }

  .profile-avatar {
    width: 90px;
    height: 90px;
  }

  .profile-section {
    bottom: -40px;
  }

  .points-icon {
    width: 28px;
    height: 28px;
    font-size: 16px;
    top: -6px;
    right: -6px;
  }

  .connect-wallet-btn {
    padding: 6px 10px;
    font-size: 12px;
    min-width: 100px;
  }
}

/* ریسپانسیو */
@media (min-width: 600px) {
  .container {
    max-width: 600px;
  }
  
  .events-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* استایل دکمه شناور */
.floating-action-button {
  position: fixed;
  bottom: 80px;
  right: 24px;
  height: 56px;
  padding: 0 24px;
  border-radius: 28px;
  background: linear-gradient(135deg, #1D3557, #457B9D);
  color: #F1FAEE;
  border: none;
  box-shadow: 0 4px 12px rgba(29, 53, 87, 0.25);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  font-family: 'Inter', system-ui, sans-serif;
}

.floating-action-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 20px rgba(29, 53, 87, 0.3);
  background: linear-gradient(135deg, #2B4D80, #5B8FB9);
}

.floating-action-button:active {
  transform: translateY(0) scale(0.98);
}

.fab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.fab-label {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

/* انیمیشن ورود دکمه */
@keyframes slideIn {
  from {
    transform: translate(100px, 100px);
    opacity: 0;
  }
  to {
    transform: translate(0, 0);
    opacity: 1;
  }
}

.floating-action-button {
  animation: slideIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@media (max-width: 600px) {
  .floating-action-button {
    padding: 0;
    width: 56px;
    border-radius: 50%;
  }
  
  .fab-label {
    display: none;
  }
  
  .fab-icon {
    margin: 0 auto;
  }
}
</style>
