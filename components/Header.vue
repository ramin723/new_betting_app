<template>
    <header class="header-container">
      <!-- فلش بازگشت -->
      <button v-if="showBackButton" class="back-button" @click="goBack">
        ←
      </button>
      <div v-else class="placeholder"></div>
      <!-- عنوان صفحه -->
      <h1 class="page-title">{{ title }}</h1>
      <!-- اکشن‌های راست -->
      <div class="header-actions">
        <NuxtLink v-if="user && !isAdminPage" to="/events/create" class="create-btn">
          ➕
        </NuxtLink>
        <button @click="onNotification">🔔</button>
        <button @click="onPoints">🏅 {{ userPoints }}</button>
        <button @click="toggleUserMenu">👤</button>
      </div>
    </header>
    <!-- منوی کاربر -->
    <div v-if="showUserMenu" class="user-menu">
      <div class="menu-item" @click="goToProfile">پروفایل</div>
      <div class="menu-item" @click="goToWallet">کیف پول</div>
      <div v-if="isAdmin" class="menu-item" @click="goToAdmin">پنل ادمین</div>
      <div class="menu-item" @click="handleLogout">خروج</div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  const router = useRouter();
  const route = useRoute();

  // Props
  const props = defineProps({
    title: {
      type: String,
      default: 'Battles'
    },
    showBackButton: {
      type: Boolean,
      default: false
    }
  });

  // Auth
  const { user, isAdmin, adminLogout } = useAuth();

  // State
  const showUserMenu = ref(false);
  const userPoints = ref(1500);

  // Computed
  const isAdminPage = computed(() => route.path.startsWith('/admin'));

  // Methods
  const goBack = () => {
    router.back();
  };

  const onNotification = () => {
    // نمایش پنجره اعلان‌ها
  };

  const onPoints = () => {
    // نمایش جزئیات امتیاز
  };

  const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value;
  };

  const goToProfile = () => {
    router.push('/profile');
    showUserMenu.value = false;
  };

  const goToWallet = () => {
    router.push('/wallet');
    showUserMenu.value = false;
  };

  const goToAdmin = () => {
    router.push('/admin/events');
    showUserMenu.value = false;
  };

  const handleLogout = () => {
    if (isAdmin.value) {
      adminLogout();
    }
    showUserMenu.value = false;
  };
  </script>
  
  <style scoped>
  .header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    padding: 0 16px;
    height: 56px; /* یک ارتفاع استاندارد موبایل */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
  }
  .back-button, .placeholder {
    width: 40px;
    border: none;
    background: none;
    font-size: 20px;
    cursor: pointer;
  }
  .page-title {
    font-size: 18px;
    font-weight: bold;
    margin: 0;
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .header-actions button, .create-btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
  }
  .create-btn {
    color: #457B9D;
    transition: transform 0.2s ease;
  }
  .create-btn:hover {
    transform: scale(1.1);
  }
  .user-menu {
    position: absolute;
    top: 100%;
    right: 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 8px 0;
    z-index: 1000;
  }
  .menu-item {
    padding: 8px 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .menu-item:hover {
    background-color: #F1FAEE;
  }
  </style>
  