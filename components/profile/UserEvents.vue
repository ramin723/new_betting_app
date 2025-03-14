<template>
  <div class="user-events">
    <!-- فیلترها -->
    <div class="filters">
      <button 
        v-for="filter in filters" 
        :key="filter.id"
        :class="['filter-btn', { active: activeFilter === filter.id }]"
        @click="activeFilter = filter.id"
      >
        {{ filter.title }}
      </button>
    </div>

    <!-- لیست رویدادها -->
    <div class="events-list">
      <div v-if="loading" class="loading-state">
        در حال بارگذاری...
      </div>
      <div v-else-if="error" class="error-state">
        خطا در دریافت رویدادها
        <button @click="loadEvents" class="retry-btn">تلاش مجدد</button>
      </div>
      <template v-else>
        <div v-if="filteredEvents.length === 0" class="empty-state">
          <p>رویدادی یافت نشد</p>
          <button @click="activeFilter = 'all'" class="retry-btn">نمایش همه</button>
        </div>
        <div v-else class="events-grid">
          <div v-for="event in filteredEvents" :key="event.id" class="event-card">
            <div class="event-header">
              <span class="event-status" :class="event.status">{{ getStatusText(event.status) }}</span>
              <span class="event-date">{{ formatDate(event.created_at) }}</span>
            </div>
            <h3 class="event-title">{{ event.title }}</h3>
            <p class="event-question">{{ event.question }}</p>
            <div class="event-footer">
              <div class="event-stats">
                <span class="stat">
                  <span class="icon">👥</span>
                  {{ formatNumber(event.participants_count) }}
                </span>
                <span class="stat">
                  <span class="icon">💰</span>
                  {{ formatNumber(event.total_pool) }}
                </span>
              </div>
              <button class="view-btn" @click="viewEvent(event.id)">مشاهده</button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()
const loading = ref(false)
const error = ref(null)

// فیلترها
const filters = [
  { id: 'all', title: 'همه' },
  { id: 'active', title: 'فعال' },
  { id: 'closed', title: 'بسته شده' },
  { id: 'cancelled', title: 'لغو شده' }
]
const activeFilter = ref('all')

// رویدادهای فیلتر شده
const filteredEvents = computed(() => {
  if (activeFilter.value === 'all') return props.events
  return props.events.filter(event => event.status === activeFilter.value)
})

// متن وضعیت
const getStatusText = (status) => {
  const statusMap = {
    'active': 'فعال',
    'closed': 'بسته شده',
    'cancelled': 'لغو شده',
    'pending': 'در انتظار تایید'
  }
  return statusMap[status] || status
}

// فرمت تاریخ
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// فرمت اعداد
const formatNumber = (num) => {
  return new Intl.NumberFormat('fa-IR').format(num)
}

// مشاهده رویداد
const viewEvent = (eventId) => {
  router.push(`/events/${eventId}`)
}

// بارگذاری مجدد
const loadEvents = async () => {
  loading.value = true
  error.value = null
  try {
    // TODO: دریافت رویدادها از API
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.user-events {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filters {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #457B9D;
  border-radius: 16px;
  font-size: 12px;
  color: #457B9D;
  background: white;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.filter-btn.active {
  background: #457B9D;
  color: white;
}

.events-grid {
  display: grid;
  gap: 12px;
}

.event-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.event-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.event-status.active {
  background: #A8DADC;
  color: #1D3557;
}

.event-status.closed {
  background: #457B9D;
  color: white;
}

.event-status.cancelled {
  background: #E63946;
  color: white;
}

.event-date {
  font-size: 12px;
  color: #457B9D;
}

.event-title {
  font-size: 16px;
  font-weight: bold;
  color: #1D3557;
  margin: 0 0 4px;
}

.event-question {
  font-size: 14px;
  color: #457B9D;
  margin: 0 0 12px;
}

.event-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-stats {
  display: flex;
  gap: 12px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #457B9D;
}

.view-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  background: #1D3557;
  color: white;
  font-size: 12px;
  cursor: pointer;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 24px;
  color: #457B9D;
}

.retry-btn {
  margin-top: 8px;
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  background: #457B9D;
  color: white;
  cursor: pointer;
}
</style> 