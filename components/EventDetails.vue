<template>
    <div class="event-details">
      <!-- به‌جای event?.title از eventData?.title استفاده می‌کنیم -->
      <h2>{{ eventData?.title || "No Title" }}</h2>
      <p>{{ eventData?.description || "No description available" }}</p>
  
      <!-- پوستر رویداد -->
      <div class="poster-container">
        <!-- در v-if هم بررسی eventData و سپس eventData.image را انجام می‌دهیم -->
        <img v-if="eventData && eventData.image" :src="eventData.image" alt="Event Poster" class="event-poster" />
        <div v-else class="placeholder-poster">
          <span class="placeholder-icon">🎮</span>
        </div>
  
        <!-- دکمه‌های شناور -->
        <div class="floating-buttons">
          <button class="wallet-info">
            <span class="icon">💰</span>
            <span class="amount">{{ eventData?.total_pool || '0' }} SPARKS</span>
          </button>
          <button class="translate-btn">
            <span class="icon">🌍</span>
            <span class="text">ترجمه</span>
          </button>
        </div>
      </div>
  
      <!-- اطلاعات رویداد -->
      <div class="event-content">
        <div class="event-header">
          <h2 class="event-title">{{ eventData?.title }}</h2>
          <div class="event-meta">
            <span class="meta-item" v-if="eventData?.time_status">
              <span class="icon">⏰</span>
              <span class="text">{{ formatTimeLeft }}</span>
            </span>
            <span class="meta-item">
              <span class="icon">👥</span>
              <span class="text">{{ totalParticipants }} شرکت‌کننده</span>
            </span>
            <span class="meta-item">
              <span class="icon">💰</span>
              <span class="text">{{ formatNumber(eventData?.total_pool || 0) }} TON</span>
            </span>
          </div>
        </div>
  
        <div class="event-description">
          <p :class="{ 'truncated': !showFullDescription }">
            {{ eventData?.description || 'توضیحاتی موجود نیست' }}
          </p>
          <button 
            v-if="hasLongDescription" 
            class="see-more-btn"
            @click="toggleDescription"
          >
            {{ showFullDescription ? 'نمایش کمتر ▲' : 'نمایش بیشتر ▼' }}
          </button>
        </div>
  
        <!-- تگ‌های رویداد -->
        <div class="event-tags">
          <span 
            v-for="tag in eventData?.Tags" 
            :key="tag.id" 
            class="tag"
          >
            {{ getEmoji(tag.name) }} {{ tag.name }}
          </span>
        </div>
  
        <!-- تایمرهای دایره‌ای -->
        <div class="event-timers">
          <div class="timer-box">
            <p class="timer-label">زمان ثبت</p>
            <CircularProgress 
              :value="calculateSubmissionProgress" 
              :total="100" 
              color="#457B9D"
            />
          </div>
          <div class="timer-box">
            <p class="timer-label">زمان پایان</p>
            <CircularProgress 
              :value="calculateBattleProgress" 
              :total="100" 
              color="#E63946"
            />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from "vue";
  import CircularProgress from "~/components/CircularProgress.vue";
  
  /** ۱) نام prop را از event به eventData تغییر دهید. **/
  const props = defineProps({
    eventData: {
      type: Object,
      required: true
    }
  });
  
  /** ۲) بقیه کد بدون تغییر خاصی، جز جایگزینی event با eventData **/
  const showFullDescription = ref(false);
  const toggleDescription = () => {
    showFullDescription.value = !showFullDescription.value;
  };
  
  // بررسی طول توضیحات برای نمایش دکمه بیشتر/کمتر
  const hasLongDescription = computed(() => {
    return props.eventData?.description?.length > 100;
  });
  
  // محاسبه تعداد کل شرکت‌کنندگان
  const totalParticipants = computed(() => {
    if (!props.eventData?.Options) return 0;
    return props.eventData.Options.reduce((total, option) => {
      return total + (option.betting_stats?.unique_users || 0);
    }, 0);
  });
  
  // فرمت‌کردن زمان باقی‌مانده
  const formatTimeLeft = computed(() => {
    if (!props.eventData?.time_status) return '';
    
    if (props.eventData.time_status.is_ended) {
      return 'پایان یافته';
    }
    
    if (props.eventData.time_status.is_betting_open) {
      const timeLeft = props.eventData.time_status.betting_time_left;
      return formatTime(timeLeft);
    }
    
    return 'در انتظار نتیجه';
  });
  
  // تابع کمکی برای فرمت کردن زمان
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} روز مانده`;
    if (hours > 0) return `${hours} ساعت مانده`;
    if (minutes > 0) return `${minutes} دقیقه مانده`;
    return `${seconds} ثانیه مانده`;
  };
  
  // فرمت کردن اعداد
  const formatNumber = (num) => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };
  
  // محاسبه پیشرفت زمان ثبت
  const calculateSubmissionProgress = computed(() => {
    if (!props.eventData?.time_status?.betting_time_left) return 0;
    const timeLeft = props.eventData.time_status.betting_time_left;
    const totalTime = props.eventData.betting_deadline - props.eventData.start_time;
    return Math.min(Math.max(((totalTime - timeLeft) / totalTime) * 100, 0), 100);
  });
  
  // محاسبه پیشرفت زمان پایان
  const calculateBattleProgress = computed(() => {
    if (!props.eventData?.time_status?.result_time_left) return 0;
    const timeLeft = props.eventData.time_status.result_time_left;
    const totalTime = props.eventData.result_time - props.eventData.end_time;
    return Math.min(Math.max(((totalTime - timeLeft) / totalTime) * 100, 0), 100);
  });
  
  // تابع کمکی برای ایموجی‌ها
  const getEmoji = (categoryName) => {
    const emojiMap = {
      'Battles': '🔥',
      'TON/Crypto': '💰',
      'Sport': '⚽',
      'Esports': '🎮',
      'Football': '⚽',
      'Crypto': '💎',
      'Bitcoin': '₿',
      'CS:GO': '🎯',
      'Meme coins': '🐕',
    };
    return emojiMap[categoryName] || '��';
  };
  </script>
  
  <style scoped>
  /* استایل‌ها همان قبلی */
  .event-details {
    background: #F1FAEE;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(29, 53, 87, 0.1);
    margin-bottom: 12px;
  }
  .poster-container {
    position: relative;
    width: 100%;
    height: 200px;
    background: #457B9D;
    overflow: hidden;
  }
  .event-poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .placeholder-poster {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #457B9D;
  }
  .placeholder-icon {
    font-size: 48px;
  }
  .floating-buttons {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    gap: 8px;
  }
  .wallet-info, .translate-btn {
    background: rgba(241, 250, 238, 0.9);
    border: none;
    padding: 8px 12px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #1D3557;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .wallet-info:hover, .translate-btn:hover {
    background: #F1FAEE;
    transform: translateY(-1px);
  }
  .event-content {
    padding: 16px;
  }
  .event-header {
    margin-bottom: 16px;
  }
  .event-title {
    color: #1D3557;
    font-size: 1.5rem;
    margin: 0 0 8px 0;
    font-weight: bold;
  }
  .event-meta {
    display: flex;
    gap: 16px;
    color: #457B9D;
    font-size: 0.9rem;
  }
  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .event-description {
    color: #457B9D;
    line-height: 1.6;
    margin-bottom: 16px;
    max-height: 4.5em;
    overflow: hidden;
    position: relative;
  }
  .event-description .truncated {
    display: block;
    max-height: 4.5em;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
  }
  .event-description .truncated::after {
    content: '...';
    position: absolute;
    bottom: 0;
    right: 0;
    background: #F1FAEE;
    padding: 0 4px;
  }
  /* برای مرورگرهای قدیمی */
  @supports not (-webkit-line-clamp: 3) {
    .event-description .truncated {
      max-height: 4.5em;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
      position: relative;
    }
    
    .event-description .truncated::after {
      content: '...';
      position: absolute;
      bottom: 0;
      right: 0;
      background: #F1FAEE;
      padding: 0 4px;
    }
  }
  .see-more-btn {
    background: none;
    border: none;
    color: #457B9D;
    cursor: pointer;
    padding: 4px 0;
    font-size: 0.9rem;
    transition: color 0.3s ease;
  }
  .see-more-btn:hover {
    color: #1D3557;
  }
  .event-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }
  .tag {
    background: #A8DADC;
    color: #457B9D;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .event-timers {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
  }
  .timer-box {
    text-align: center;
  }
  .timer-label {
    color: #457B9D;
    font-size: 0.9rem;
    margin-bottom: 8px;
  }
  /* ریسپانسیو */
  @media (min-width: 600px) {
    .event-timers {
      justify-content: center;
      gap: 32px;
    }
  }
  </style>
  