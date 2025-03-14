<template>
  <div class="profile-page">
    <!-- هدر -->
    <Header title="پروفایل" :show-back-button="true" />

    <!-- کارت اصلی پروفایل -->
    <div v-if="user" class="profile-card">
      <!-- پوستر هدر -->
      <div class="profile-header">
        <div class="profile-banner" />
        <div class="profile-avatar-container">
          <div class="profile-avatar" />
          <button class="edit-avatar-btn">📷</button>
        </div>
      </div>

      <!-- اطلاعات کاربر -->
      <div class="profile-info">
        <h2 class="username">{{ user.username }}</h2>
        <p class="user-role">{{ user.role === 'admin' ? 'مدیر' : 'کاربر' }}</p>
        
        <!-- دکمه‌های اصلی -->
        <div class="action-buttons">
          <button class="action-btn referral">
            <span class="icon">🔗</span>
            <span class="text">کد معرف</span>
          </button>
          <button class="action-btn settings">
            <span class="icon">⚙️</span>
            <span class="text">تنظیمات</span>
          </button>
        </div>
      </div>
    </div>

    <!-- کارت آمار -->
    <div v-if="user" class="stats-card">
      <div class="stat-item">
        <span class="stat-label">موجودی</span>
        <span class="stat-value">{{ formatNumber(user.balance || 0) }} تومان</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">کمیسیون</span>
        <span class="stat-value">{{ formatNumber(user.commission || 0) }} تومان</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">امتیاز</span>
        <span class="stat-value">{{ formatNumber(user.points || 0) }}</span>
      </div>
    </div>

    <!-- تب‌های محتوا -->
    <div v-if="user" class="content-tabs">
      <div class="tabs-header">
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
        <template v-if="activeTab === 'events'">
          <UserEvents :events="events" />
        </template>
        <template v-if="activeTab === 'bets'">
          <UserBets :bets="bets" />
        </template>
        <template v-if="activeTab === 'wallet'">
          <UserWallet :transactions="transactions" />
        </template>
        <template v-if="activeTab === 'earnings'">
          <UserEarnings :userId="user.id" />
        </template>
      </div>
    </div>

    <!-- نوار پیمایش پایین -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import Header from '~/components/Header.vue'
import BottomNav from '~/components/BottomNav.vue'
import UserEvents from '~/components/profile/UserEvents.vue'
import UserBets from '~/components/profile/UserBets.vue'
import UserWallet from '~/components/profile/UserWallet.vue'
import UserEarnings from '~/components/profile/UserEarnings.vue'

const { user } = useAuth()

// تب‌ها
const tabs = [
  { id: 'events', title: 'رویدادها' },
  { id: 'bets', title: 'شرط‌ها' },
  { id: 'wallet', title: 'کیف پول' },
  { id: 'earnings', title: 'درآمدها' }
]
const activeTab = ref('events')

// داده‌ها
const events = ref([])
const bets = ref([])
const transactions = ref([])

// فرمت اعداد
const formatNumber = (num) => {
  return new Intl.NumberFormat('fa-IR').format(num)
}

// دریافت داده‌ها
onMounted(async () => {
  if (user.value?.id) {
    try {
      // دریافت رویدادها
      const eventsResponse = await fetch(`/api/users/${user.value.id}/events`)
      const eventsData = await eventsResponse.json()
      if (eventsData.success) {
        events.value = eventsData.events
      }

      // دریافت شرط‌ها
      const betsResponse = await fetch(`/api/users/${user.value.id}/bets`)
      const betsData = await betsResponse.json()
      if (betsData.success) {
        bets.value = betsData.bets
      }

      // دریافت تراکنش‌ها
      const transactionsResponse = await fetch(`/api/users/${user.value.id}/wallet-history`)
      const transactionsData = await transactionsResponse.json()
      if (transactionsData.success) {
        transactions.value = transactionsData.transactions
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #F1FAEE;
  padding-bottom: 70px;
}

.profile-card {
  background: white;
  border-radius: 12px;
  margin: 16px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.profile-header {
  position: relative;
  height: 150px;
}

.profile-banner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #457B9D 0%, #1D3557 100%);
}

.profile-avatar-container {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid white;
  background: #F1FAEE;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23457B9D' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E");
  background-size: 60%;
  background-position: center;
  background-repeat: no-repeat;
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #457B9D;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 12px;
  cursor: pointer;
}

.profile-info {
  padding: 48px 16px 16px;
  text-align: center;
}

.username {
  font-size: 18px;
  font-weight: bold;
  color: #1D3557;
  margin: 0;
}

.user-role {
  color: #457B9D;
  font-size: 14px;
  margin: 4px 0 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.referral {
  background: #E63946;
  color: white;
}

.settings {
  background: #457B9D;
  color: white;
}

.stats-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 16px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #457B9D;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #1D3557;
  margin-top: 4px;
}

.content-tabs {
  margin: 16px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #E9ECEF;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  font-size: 14px;
  color: #457B9D;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  color: #E63946;
  border-bottom: 2px solid #E63946;
}

.tab-content {
  padding: 16px;
}
</style> 