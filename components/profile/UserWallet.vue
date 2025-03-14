<template>
  <div class="user-wallet">
    <!-- خلاصه کیف پول -->
    <div class="wallet-summary">
      <div class="balance-card">
        <span class="label">موجودی فعلی</span>
        <span class="value">{{ formatNumber(balance) }} تومان</span>
        <div class="actions">
          <button class="action-btn deposit">
            <span class="icon">↑</span>
            <span class="text">افزایش موجودی</span>
          </button>
          <button class="action-btn withdraw">
            <span class="icon">↓</span>
            <span class="text">برداشت</span>
          </button>
        </div>
      </div>
    </div>

    <!-- فیلترهای تراکنش -->
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

    <!-- لیست تراکنش‌ها -->
    <div class="transactions-list">
      <div v-if="loading" class="loading-state">
        در حال بارگذاری...
      </div>
      <div v-else-if="error" class="error-state">
        خطا در دریافت تراکنش‌ها
        <button @click="loadTransactions" class="retry-btn">تلاش مجدد</button>
      </div>
      <template v-else>
        <div v-if="filteredTransactions.length === 0" class="empty-state">
          <p>تراکنشی یافت نشد</p>
          <button @click="activeFilter = 'all'" class="retry-btn">نمایش همه</button>
        </div>
        <div v-else class="transactions-grid">
          <div v-for="tx in filteredTransactions" :key="tx.id" class="transaction-card">
            <div class="tx-header">
              <div class="tx-type" :class="tx.type">
                <span class="icon">{{ getTypeIcon(tx.type) }}</span>
                <span class="text">{{ getTypeText(tx.type) }}</span>
              </div>
              <span class="tx-date">{{ formatDate(tx.created_at) }}</span>
            </div>
            <div class="tx-details">
              <div class="tx-amount" :class="tx.type">
                {{ tx.type === 'deposit' ? '+' : '-' }}
                {{ formatNumber(tx.amount) }} تومان
              </div>
              <div class="tx-status" :class="tx.status">
                {{ getStatusText(tx.status) }}
              </div>
            </div>
            <p v-if="tx.description" class="tx-description">
              {{ tx.description }}
            </p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  transactions: {
    type: Array,
    default: () => []
  }
})

const loading = ref(false)
const error = ref(null)
const balance = ref(15000000) // مقدار تستی

// فیلترها
const filters = [
  { id: 'all', title: 'همه' },
  { id: 'deposit', title: 'واریز' },
  { id: 'withdraw', title: 'برداشت' },
  { id: 'bet', title: 'شرط' },
  { id: 'win', title: 'برد' }
]
const activeFilter = ref('all')

// تراکنش‌های فیلتر شده
const filteredTransactions = computed(() => {
  if (activeFilter.value === 'all') return props.transactions
  return props.transactions.filter(tx => tx.type === activeFilter.value)
})

// آیکون نوع تراکنش
const getTypeIcon = (type) => {
  const icons = {
    'deposit': '↑',
    'withdraw': '↓',
    'bet': '🎲',
    'win': '🏆',
    'commission': '💰'
  }
  return icons[type] || '💱'
}

// متن نوع تراکنش
const getTypeText = (type) => {
  const types = {
    'deposit': 'واریز به کیف پول',
    'withdraw': 'برداشت از کیف پول',
    'bet': 'ثبت شرط',
    'win': 'برد در شرط',
    'commission': 'کمیسیون'
  }
  return types[type] || type
}

// متن وضعیت
const getStatusText = (status) => {
  const statusMap = {
    'pending': 'در حال پردازش',
    'completed': 'تکمیل شده',
    'failed': 'ناموفق',
    'cancelled': 'لغو شده'
  }
  return statusMap[status] || status
}

// فرمت تاریخ
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// فرمت اعداد
const formatNumber = (num) => {
  return new Intl.NumberFormat('fa-IR').format(num)
}

// بارگذاری مجدد
const loadTransactions = async () => {
  loading.value = true
  error.value = null
  try {
    // TODO: دریافت تراکنش‌ها از API
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.user-wallet {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wallet-summary {
  margin-bottom: 8px;
}

.balance-card {
  background: linear-gradient(135deg, #1D3557, #457B9D);
  border-radius: 12px;
  padding: 16px;
  color: white;
  text-align: center;
}

.balance-card .label {
  font-size: 14px;
  opacity: 0.9;
}

.balance-card .value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  margin: 8px 0 16px;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.deposit {
  background: #A8DADC;
  color: #1D3557;
}

.action-btn.withdraw {
  background: #F1FAEE;
  color: #1D3557;
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

.transactions-grid {
  display: grid;
  gap: 12px;
}

.transaction-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.tx-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tx-type {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.tx-type.deposit { color: #2ECC71; }
.tx-type.withdraw { color: #E63946; }
.tx-type.bet { color: #457B9D; }
.tx-type.win { color: #F4A261; }
.tx-type.commission { color: #2A9D8F; }

.tx-date {
  font-size: 12px;
  color: #457B9D;
}

.tx-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tx-amount {
  font-size: 16px;
  font-weight: 500;
}

.tx-amount.deposit { color: #2ECC71; }
.tx-amount.withdraw { color: #E63946; }
.tx-amount.bet { color: #457B9D; }
.tx-amount.win { color: #F4A261; }

.tx-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.tx-status.pending {
  background: #F1FAEE;
  color: #457B9D;
}

.tx-status.completed {
  background: #A8DADC;
  color: #1D3557;
}

.tx-status.failed {
  background: #E63946;
  color: white;
}

.tx-description {
  font-size: 12px;
  color: #457B9D;
  margin: 0;
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