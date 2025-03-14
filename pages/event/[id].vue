<template>
  <div class="event-page">
    <!-- هدر -->
    <header class="page-header">
      <button class="back-btn" @click="handleBack">
        <span class="icon">←</span>
        <span>بازگشت</span>
      </button>
      <h1>جزئیات رویداد</h1>
    </header>

    <!-- محتوای اصلی -->
    <main class="event-content">
      <div v-if="isLoading" class="loading">
        در حال بارگذاری...
      </div>
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      <template v-else>
        <!-- جزئیات رویداد -->
        <EventDetails 
          v-if="eventData" 
          :eventData="eventData" 
        />

        <!-- بخش شرط‌بندی -->
        <EventBetting 
          v-if="eventData" 
          :eventData="eventData"
          @place-bet="handlePlaceBet"
        />
      </template>
    </main>

    <!-- ناوبری پایین -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EventDetails from '~/components/EventDetails.vue';
import EventBetting from '~/components/EventBetting.vue';
import BottomNav from '~/components/BottomNav.vue';

const route = useRoute();
const router = useRouter();
const eventData = ref(null);
const isLoading = ref(true);
const error = ref(null);

// دریافت اطلاعات رویداد
const fetchEventData = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await fetch(`/api/events/${route.params.id}`);
    if (!response.ok) {
      throw new Error('خطا در دریافت اطلاعات');
    }
    const data = await response.json();
    
    if (!data.success || !data.event) {
      throw new Error('داده‌های رویداد نامعتبر است');
    }

    // اطلاعات رویداد را مستقیماً استفاده می‌کنیم
    eventData.value = data.event;
    console.log('Event Data:', eventData.value); // برای دیباگ
  } catch (err) {
    console.error('خطا:', err);
    error.value = 'خطا در دریافت اطلاعات رویداد';
  } finally {
    isLoading.value = false;
  }
};

// ثبت شرط
const handlePlaceBet = async (betData) => {
  try {
    const response = await fetch(`/api/events/${route.params.id}/bets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(betData)
    });

    const data = await response.json();
    if (data.success) {
      // به‌روزرسانی اطلاعات رویداد
      await fetchEventData();
      alert('شرط شما با موفقیت ثبت شد');
    } else {
      alert(data.message || 'خطا در ثبت شرط');
    }
  } catch (error) {
    console.error('خطا در ثبت شرط:', error);
    alert('خطا در ثبت شرط');
  }
};

const handleBack = () => {
  router.push('/');
};

onMounted(() => {
  fetchEventData();
});
</script>

<style scoped>
.event-page {
  min-height: 100vh;
  background: #A8DADC;
  padding-bottom: 60px;
}

.page-header {
  background: #F1FAEE;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(29, 53, 87, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #457B9D;
  font-size: 1rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.back-btn:hover {
  background: rgba(69, 123, 157, 0.1);
}

.page-header h1 {
  margin: 0;
  color: #1D3557;
  font-size: 1.2rem;
}

.event-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  color: #1D3557;
  background: #F1FAEE;
  border-radius: 8px;
  margin: 16px;
}

.error {
  color: #E63946;
}
</style>