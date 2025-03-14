<template>
  <div class="user-earnings">
    <!-- خلاصه درآمد -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <span>در حال بارگذاری اطلاعات درآمد...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <span class="error-message">{{ error }}</span>
      <button @click="fetchSummary" class="retry-btn">تلاش مجدد</button>
    </div>

    <template v-else>
      <div class="earnings-summary">
        <div class="summary-card total">
          <span class="label">کل درآمد</span>
          <span class="value">{{ formatNumber(totalEarnings) }} تومان</span>
          <div class="details">
            <div class="detail-item">
              <span>دریافت شده</span>
              <span class="received">{{ formatNumber(receivedEarnings) }} تومان</span>
            </div>
            <div class="detail-item">
              <span>در انتظار</span>
              <span class="pending">{{ formatNumber(pendingEarnings) }} تومان</span>
            </div>
          </div>
        </div>
      </div>

      <!-- تب‌های درآمد -->
      <div class="earnings-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.title }}
        </button>
      </div>

      <!-- محتوای تب‌ها -->
      <div class="tab-content">
        <!-- کمیسیون رویدادها -->
        <div v-if="activeTab === 'events'" class="events-earnings">
          <div class="section-header">
            <h3>درآمد از رویدادهای ساخته شده</h3>
            <div class="stats">
              <div class="stat-item">
                <span class="label">تعداد کل رویدادها</span>
                <span class="value">{{ formatNumber(summary.events.total_events) }}</span>
              </div>
              <div class="stat-item">
                <span class="label">مجموع شرکت‌کنندگان</span>
                <span class="value">{{ formatNumber(summary.events.total_participants) }}</span>
              </div>
            </div>
          </div>

          <!-- لیست رویدادها -->
          <div v-if="isLoadingDetails" class="loading-state">
            <div class="spinner"></div>
            <span>در حال بارگذاری جزئیات...</span>
          </div>

          <div v-else class="events-list">
            <div v-for="event in events" :key="event.id" class="event-card">
              <div class="event-header">
                <h4>{{ event.title }}</h4>
                <span class="event-date">{{ formatDate(event.created_at) }}</span>
              </div>
              <div class="event-stats">
                <div class="stat">
                  <span class="icon">👥</span>
                  <span>{{ formatNumber(event.participants_count) }} شرکت‌کننده</span>
                </div>
                <div class="stat">
                  <span class="icon">💰</span>
                  <span>{{ formatNumber(event.total_pool) }} تومان کل شرط‌ها</span>
                </div>
              </div>
              <div class="event-earnings">
                <div class="earning-item">
                  <span>کمیسیون:</span>
                  <span class="amount">{{ formatNumber(event.commission_amount) }} تومان</span>
                </div>
                <div class="earning-item">
                  <span>درصد کمیسیون:</span>
                  <span>{{ (event.commission_creator * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>

            <!-- صفحه‌بندی -->
            <div v-if="pagination.total_pages > 1" class="pagination">
              <button 
                :disabled="pagination.page === 1"
                @click="changePage(pagination.page - 1)"
                class="page-btn"
              >
                قبلی
              </button>
              <span class="page-info">صفحه {{ pagination.page }} از {{ pagination.total_pages }}</span>
              <button 
                :disabled="pagination.page === pagination.total_pages"
                @click="changePage(pagination.page + 1)"
                class="page-btn"
              >
                بعدی
              </button>
            </div>
          </div>
        </div>

        <!-- کمیسیون دعوت -->
        <div v-else-if="activeTab === 'referrals'" class="referrals-earnings">
          <div class="section-header">
            <h3>درآمد از دعوت کاربران</h3>
            <div class="stats">
              <div class="stat-item">
                <span class="label">تعداد کاربران دعوت شده</span>
                <span class="value">{{ formatNumber(summary.referrals.total_referrals) }}</span>
              </div>
              <div class="stat-item">
                <span class="label">کاربران فعال</span>
                <span class="value">{{ formatNumber(summary.referrals.total_referred_users) }}</span>
              </div>
            </div>
          </div>

          <!-- لیست دعوت‌ها -->
          <div v-if="isLoadingDetails" class="loading-state">
            <div class="spinner"></div>
            <span>در حال بارگذاری جزئیات...</span>
          </div>

          <div v-else class="referrals-list">
            <div v-for="referral in referrals" :key="referral.id" class="referral-card">
              <div class="referral-header">
                <div class="event-info">
                  <h4>{{ referral.Event.title }}</h4>
                  <span class="event-date">{{ formatDate(referral.created_at) }}</span>
                </div>
                <div class="referral-code">
                  کد دعوت: {{ referral.referral_code }}
                </div>
              </div>
              <div class="referral-stats">
                <div class="stat">
                  <span class="icon">🎲</span>
                  <span>{{ formatNumber(referral.total_bets) }} شرط</span>
                </div>
                <div class="stat">
                  <span class="icon">💰</span>
                  <span>{{ formatNumber(referral.total_bet_amount) }} تومان</span>
                </div>
              </div>
              <div class="referral-earnings">
                <div v-for="commission in referral.PendingCommissions" :key="commission.id" class="earning-item">
                  <span>کمیسیون {{ commission.status === 'pending' ? 'در انتظار' : 'دریافت شده' }}:</span>
                  <span :class="['amount', commission.status === 'pending' ? 'pending' : 'received']">
                    {{ formatNumber(commission.amount) }} تومان
                  </span>
                </div>
                <div class="earning-item">
                  <span>درصد کمیسیون:</span>
                  <span>{{ (referral.Event.commission_referral * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>

            <!-- صفحه‌بندی -->
            <div v-if="pagination.total_pages > 1" class="pagination">
              <button 
                :disabled="pagination.page === 1"
                @click="changePage(pagination.page - 1)"
                class="page-btn"
              >
                قبلی
              </button>
              <span class="page-info">صفحه {{ pagination.page }} از {{ pagination.total_pages }}</span>
              <button 
                :disabled="pagination.page === pagination.total_pages"
                @click="changePage(pagination.page + 1)"
                class="page-btn"
              >
                بعدی
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

// وضعیت‌های بارگذاری
const isLoading = ref(true)
const isLoadingDetails = ref(false)
const error = ref(null)

// داده‌ها
const summary = ref({
  events: {
    total_commission: 0,
    total_events: 0,
    total_participants: 0,
    pending_commission: 0
  },
  referrals: {
    total_commission: 0,
    pending_commission: 0,
    total_referrals: 0,
    total_referred_users: 0
  }
})

const events = ref([])
const referrals = ref([])
const pagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  total_pages: 0
})

// تب‌ها
const tabs = [
  { id: 'events', title: 'درآمد رویدادها' },
  { id: 'referrals', title: 'درآمد دعوت' }
]
const activeTab = ref('events')

// دریافت خلاصه درآمد
const fetchSummary = async () => {
  try {
    isLoading.value = true
    error.value = null
    const response = await fetch(`/api/users/${props.userId}/earnings/summary`)
    const result = await response.json()
    if (!result.success) throw new Error(result.message)
    summary.value = result.data
  } catch (err) {
    error.value = err.message
    console.error('Error fetching earnings summary:', err)
  } finally {
    isLoading.value = false
  }
}

// دریافت جزئیات درآمد
const fetchDetails = async () => {
  try {
    isLoadingDetails.value = true
    error.value = null
    const response = await fetch(
      `/api/users/${props.userId}/earnings/details?type=${activeTab.value}&page=${pagination.value.page}&limit=${pagination.value.limit}`
    )
    const result = await response.json()
    if (!result.success) throw new Error(result.message)
    
    if (activeTab.value === 'events') {
      events.value = result.data
    } else {
      referrals.value = result.data
    }
    pagination.value = result.pagination
  } catch (err) {
    error.value = err.message
    console.error('Error fetching earnings details:', err)
  } finally {
    isLoadingDetails.value = false
  }
}

// تغییر صفحه
const changePage = (newPage) => {
  pagination.value.page = newPage
  fetchDetails()
}

// محاسبات
const totalEarnings = computed(() => {
  return summary.value.events.total_commission + summary.value.referrals.total_commission
})

const receivedEarnings = computed(() => {
  return (summary.value.events.total_commission - summary.value.events.pending_commission) +
         (summary.value.referrals.total_commission - summary.value.referrals.pending_commission)
})

const pendingEarnings = computed(() => {
  return summary.value.events.pending_commission + summary.value.referrals.pending_commission
})

// بارگذاری اولیه
onMounted(() => {
  fetchSummary()
  fetchDetails()
})

// پیگیری تغییر تب
watch(activeTab, () => {
  pagination.value.page = 1
  fetchDetails()
})

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
</script>

<style scoped>
.user-earnings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.earnings-summary {
  margin-bottom: 16px;
}

.summary-card {
  background: linear-gradient(135deg, #1D3557, #457B9D);
  border-radius: 12px;
  padding: 16px;
  color: white;
}

.summary-card .label {
  font-size: 14px;
  opacity: 0.9;
}

.summary-card .value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  margin: 8px 0;
}

.details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.detail-item .received {
  color: #A8DADC;
  font-weight: 500;
}

.detail-item .pending {
  color: #E63946;
  font-weight: 500;
}

.earnings-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #457B9D;
  border-radius: 8px;
  background: white;
  color: #457B9D;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #457B9D;
  color: white;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  color: #1D3557;
  margin: 0 0 8px;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.stat-item {
  background: #F1FAEE;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.stat-item .label {
  font-size: 12px;
  color: #457B9D;
}

.stat-item .value {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #1D3557;
  margin-top: 4px;
}

.events-list, .referrals-list {
  display: grid;
  gap: 12px;
}

.event-card, .referral-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.event-header, .referral-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.event-header h4 {
  font-size: 16px;
  color: #1D3557;
  margin: 0;
}

.event-date, .join-date {
  font-size: 12px;
  color: #457B9D;
}

.event-stats, .referral-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #457B9D;
}

.event-earnings, .referral-earnings {
  background: #F1FAEE;
  border-radius: 6px;
  padding: 8px;
}

.earning-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding: 4px 0;
}

.amount {
  font-weight: 500;
}

.amount.received {
  color: #2ECC71;
}

.amount.pending {
  color: #E63946;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #1D3557;
}

.total-commission {
  text-align: right;
}

.total-commission .amount {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #1D3557;
}

.total-commission .label {
  font-size: 10px;
  color: #457B9D;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  color: #457B9D;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #F1FAEE;
  border-top-color: #457B9D;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
}

.error-message {
  color: #E63946;
  text-align: center;
}

.retry-btn {
  padding: 8px 16px;
  background: #457B9D;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #1D3557;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}

.page-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #457B9D;
  border-radius: 6px;
  color: #457B9D;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #457B9D;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #457B9D;
}

.referral-code {
  font-size: 12px;
  color: #457B9D;
  background: #F1FAEE;
  padding: 4px 8px;
  border-radius: 4px;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style> 