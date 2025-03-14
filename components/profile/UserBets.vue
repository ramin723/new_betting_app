<template>
  <div class="user-bets">
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

    <!-- لیست شرط‌ها -->
    <div class="bets-list">
      <div v-if="loading" class="loading-state">
        در حال بارگذاری...
      </div>
      <div v-else-if="error" class="error-state">
        خطا در دریافت شرط‌ها
        <button @click="loadBets" class="retry-btn">تلاش مجدد</button>
      </div>
      <template v-else>
        <div v-if="filteredBets.length === 0" class="empty-state">
          <p>شرطی یافت نشد</p>
          <button @click="activeFilter = 'all'" class="retry-btn">نمایش همه</button>
        </div>
        <div v-else class="bets-grid">
          <div v-for="bet in filteredBets" :key="bet.id" class="bet-card">
            <div class="bet-header">
              <span class="bet-status" :class="bet.status">{{ getStatusText(bet.status) }}</span>
              <span class="bet-date">{{ formatDate(bet.created_at) }}</span>
            </div>
            <div class="bet-event">
              <h3 class="event-title">{{ bet.event.title }}</h3>
              <p class="event-question">{{ bet.event.question }}</p>
            </div>
            <div class="bet-details">
              <div class="bet-option">
                <span class="label">گزینه انتخابی:</span>
                <span class="value">{{ bet.option.text }}</span>
              </div>
              <div class="bet-amount">
                <span class="label">مبلغ شرط:</span>
                <span class="value">{{ formatNumber(bet.amount) }} تومان</span>
              </div>
              <div class="potential-win">
                <span class="label">برد احتمالی:</span>
                <span class="value win">{{ formatNumber(bet.potential_win) }} تومان</span>
              </div>
            </div>
            <button class="view-btn" @click="viewEvent(bet.event.id)">مشاهده رویداد</button>
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
  bets: {
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
  { id: 'won', title: 'برنده' },
  { id: 'lost', title: 'بازنده' }
]
const activeFilter = ref('all')

// شرط‌های فیلتر شده
const filteredBets = computed(() => {
  if (activeFilter.value === 'all') return props.bets
  return props.bets.filter(bet => bet.status === activeFilter.value)
})

// متن وضعیت
const getStatusText = (status) => {
  const statusMap = {
    'active': 'فعال',
    'won': 'برنده',
    'lost': 'بازنده',
    'cancelled': 'لغو شده'
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
const loadBets = async () => {
  loading.value = true
  error.value = null
  try {
    // TODO: دریافت شرط‌ها از API
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.user-bets {
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

.bets-grid {
  display: grid;
  gap: 12px;
}

.bet-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.bet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.bet-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.bet-status.active {
  background: #A8DADC;
  color: #1D3557;
}

.bet-status.won {
  background: #2ECC71;
  color: white;
}

.bet-status.lost {
  background: #E63946;
  color: white;
}

.bet-status.cancelled {
  background: #95A5A6;
  color: white;
}

.bet-date {
  font-size: 12px;
  color: #457B9D;
}

.bet-event {
  margin-bottom: 12px;
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
  margin: 0;
}

.bet-details {
  background: #F1FAEE;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 12px;
}

.bet-option, .bet-amount, .potential-win {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.label {
  font-size: 12px;
  color: #457B9D;
}

.value {
  font-size: 14px;
  font-weight: 500;
  color: #1D3557;
}

.value.win {
  color: #2ECC71;
}

.view-btn {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 4px;
  background: #1D3557;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn:hover {
  background: #162436;
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