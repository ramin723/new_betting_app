<template>
  <div class="container mx-auto px-4 py-6">
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- کارت جزئیات رویداد -->
      <EventDetails 
        v-if="event"
        :eventData="event"
      />

      <!-- کارت شرط‌بندی -->
      <EventBetting 
        v-if="event"
        :eventData="event"
        @place-bet="handlePlaceBet"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EventDetails from '~/components/EventDetails.vue';
import EventBetting from '~/components/EventBetting.vue';

const route = useRoute();
const router = useRouter();
const event = ref(null);
const error = ref(null);

// دریافت اطلاعات رویداد
const fetchEventDetails = async () => {
  try {
    const response = await fetch(`/api/events/${route.params.id}`);
    const data = await response.json();
    
    if (data.success) {
      event.value = data.event;
    } else {
      error.value = data.message;
      console.error('Error fetching event:', data.message);
    }
  } catch (error) {
    error.value = 'خطا در دریافت اطلاعات رویداد';
    console.error('Error:', error);
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
      await fetchEventDetails();
      // نمایش پیام موفقیت
      alert('شرط شما با موفقیت ثبت شد.');
    } else {
      alert(data.message || 'خطا در ثبت شرط');
    }
  } catch (error) {
    console.error('Error placing bet:', error);
    alert('خطا در ثبت شرط');
  }
};

// وقتی صفحه لود می‌شود
onMounted(() => {
  fetchEventDetails();
});

// نمایش خطا
watch(error, (newError) => {
  if (newError) {
    alert(newError);
    router.push('/');
  }
});
</script> 