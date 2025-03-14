<template>
  <div class="event-betting">
    <div class="betting-header">
      <h3>شرط‌بندی</h3>
      <div class="wallet-info">
        <span class="icon">💰</span>
        <span class="amount">{{ eventData?.total_pool || '0' }} SPARKS</span>
      </div>
    </div>

    <!-- انتخاب گزینه‌ها -->
    <div class="betting-options">
      <div 
        v-for="option in sortedOptions" 
        :key="option.id"
        class="option"
        :class="{ 
          'selected': selectedOption?.id === option.id,
          'disabled': !canBet || option.is_winner !== null
        }"
        @click="selectOption(option)"
      >
        <div class="option-content">
          <span class="option-text">{{ option.text }}</span>
          <span class="option-odds">{{ option.odds }}x</span>
        </div>
        <div class="option-stats">
          <span class="stats-item">
            <span class="icon">👥</span>
            {{ option.betting_stats.unique_users }}
          </span>
          <span class="stats-item">
            <span class="icon">💰</span>
            {{ formatNumber(option.betting_stats.total_amount) }} TON
          </span>
        </div>
        <div class="option-progress">
          <div 
            class="progress-bar"
            :style="{ width: `${option.betting_stats.percentage}%` }"
          ></div>
          <span class="progress-text">{{ option.betting_stats.percentage }}%</span>
        </div>
      </div>
    </div>

    <!-- ورودی مبلغ شرط -->
    <div class="betting-amount" v-if="canBet">
      <div class="amount-input">
        <input 
          type="number" 
          v-model="betAmount"
          placeholder="مبلغ شرط را وارد کنید"
          min="0"
          step="100"
          @input="validateAmount"
        />
        <span class="currency">SPARKS</span>
      </div>
      <div class="amount-buttons">
        <button 
          v-for="amount in quickAmounts" 
          :key="amount"
          @click="setAmount(amount)"
          class="amount-btn"
        >
          {{ amount }}
        </button>
      </div>
    </div>

    <!-- اطلاعات شرط -->
    <div class="betting-info">
      <div class="info-row">
        <span>احتمال برد:</span>
        <span class="value">{{ selectedOption?.odds || '0' }}x</span>
      </div>
      <div class="info-row">
        <span>برد احتمالی:</span>
        <span class="value">{{ potentialWinnings }} SPARKS</span>
      </div>
    </div>

    <!-- دکمه‌های عملیات -->
    <div class="betting-actions">
      <button 
        class="action-btn share-btn"
        @click="shareEvent"
      >
        <span class="icon">📤</span>
        <span>اشتراک</span>
      </button>
      <button 
        class="action-btn report-btn"
        @click="reportEvent"
      >
        <span class="icon">⚠️</span>
        <span>گزارش</span>
      </button>
      <button 
        class="action-btn bet-btn"
        :class="{ 'disabled': !canPlaceBet }"
        @click="placeBet"
      >
        ثبت شرط
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  eventData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['place-bet']);

// بررسی امکان شرط‌بندی
const canBet = computed(() => {
  if (!props.eventData?.time_status) return false;
  return props.eventData.time_status.is_betting_open;
});

// مرتب‌سازی گزینه‌ها بر اساس مقدار کل شرط‌ها
const sortedOptions = computed(() => {
  if (!props.eventData?.Options) return [];
  return [...props.eventData.Options].sort((a, b) => {
    return (b.betting_stats?.total_amount || 0) - (a.betting_stats?.total_amount || 0);
  });
});

// فرمت کردن اعداد
const formatNumber = (num) => {
  return new Intl.NumberFormat('fa-IR').format(num);
};

// انتخاب گزینه
const selectedOption = ref(null);
const selectOption = (option) => {
  if (!canBet.value || option.is_winner !== null) return;
  selectedOption.value = option;
};

// مبلغ شرط
const betAmount = ref('');
const quickAmounts = [100, 500, 1000, 5000];

const setAmount = (amount) => {
  betAmount.value = amount;
};

// محاسبه برد احتمالی
const potentialWinnings = computed(() => {
  if (!selectedOption.value?.odds || !betAmount.value) return '0';
  
  const amount = parseFloat(betAmount.value);
  const odds = parseFloat(selectedOption.value.odds);
  
  if (isNaN(amount) || isNaN(odds) || amount <= 0 || odds <= 0) return '0';
  
  return (amount * odds).toFixed(2);
});

// بررسی امکان ثبت شرط
const canPlaceBet = computed(() => {
  if (!canBet.value || !selectedOption.value?.odds || !betAmount.value) return false;
  
  const amount = parseFloat(betAmount.value);
  return !isNaN(amount) && amount > 0;
});

// عملیات شرط‌بندی
const placeBet = () => {
  if (!canPlaceBet.value) return;
  
  emit('place-bet', {
    optionId: selectedOption.value.id,
    amount: parseFloat(betAmount.value)
  });
  
  // پاک کردن فرم
  selectedOption.value = null;
  betAmount.value = '';
};

// اشتراک و گزارش
const shareEvent = () => {
  // TODO: پیاده‌سازی اشتراک
  console.log('Sharing event...');
};

const reportEvent = () => {
  // TODO: پیاده‌سازی گزارش
  console.log('Reporting event...');
};

// محاسبه درصد پیشرفت
const calculateProgress = (totalBets) => {
  if (!props.eventData?.total_pool || props.eventData.total_pool === 0) return 0;
  return Math.min((totalBets / props.eventData.total_pool) * 100, 100);
};

// اعتبارسنجی مبلغ شرط
const validateAmount = (event) => {
  const value = event.target.value;
  if (value === '') return;
  
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue < 0) {
    betAmount.value = '';
  }
};
</script>

<style scoped>
.event-betting {
  background: #F1FAEE;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(29, 53, 87, 0.1);
}

.betting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.betting-header h3 {
  color: #1D3557;
  margin: 0;
  font-size: 1.2rem;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #457B9D;
  font-weight: 500;
}

.betting-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.option {
  background: #F1FAEE;
  border: 2px solid #A8DADC;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option:hover {
  border-color: #457B9D;
}

.option.selected {
  background: #457B9D;
  border-color: #457B9D;
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.option-text {
  color: #1D3557;
  font-weight: 500;
}

.option.selected .option-text {
  color: #F1FAEE;
}

.option-odds {
  color: #457B9D;
  font-weight: bold;
}

.option.selected .option-odds {
  color: #F1FAEE;
}

.option-progress {
  height: 4px;
  background: #A8DADC;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #457B9D;
  transition: width 0.3s ease;
}

.betting-amount {
  margin-bottom: 16px;
}

.amount-input {
  display: flex;
  align-items: center;
  background: #F1FAEE;
  border: 2px solid #A8DADC;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
}

.amount-input input {
  flex: 1;
  border: none;
  background: none;
  font-size: 1rem;
  color: #1D3557;
  outline: none;
}

.amount-input input::placeholder {
  color: #457B9D;
}

.currency {
  color: #457B9D;
  font-weight: 500;
}

.amount-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.amount-btn {
  background: #A8DADC;
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  color: #457B9D;
  cursor: pointer;
  transition: all 0.3s ease;
}

.amount-btn:hover {
  background: #457B9D;
  color: #F1FAEE;
}

.betting-info {
  background: #A8DADC;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  color: #457B9D;
  margin-bottom: 4px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.value {
  font-weight: bold;
}

.betting-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-btn, .report-btn {
  background: #A8DADC;
  color: #457B9D;
}

.share-btn:hover, .report-btn:hover {
  background: #457B9D;
  color: #F1FAEE;
}

.bet-btn {
  background: #E63946;
  color: #F1FAEE;
  font-weight: bold;
}

.bet-btn:hover:not(.disabled) {
  background: #c1121f;
}

.bet-btn.disabled {
  background: #A8DADC;
  color: #457B9D;
  cursor: not-allowed;
}

/* ریسپانسیو */
@media (min-width: 600px) {
  .betting-actions {
    gap: 12px;
  }
  
  .action-btn {
    padding: 14px;
  }
}

.option.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.option-stats {
  display: flex;
  gap: 12px;
  margin: 8px 0;
  color: #457B9D;
  font-size: 0.9rem;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.progress-text {
  position: absolute;
  right: 8px;
  color: #1D3557;
  font-size: 0.8rem;
  font-weight: 500;
}

.option.selected .progress-text {
  color: #F1FAEE;
}
</style>
