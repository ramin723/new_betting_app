<template>
  <NuxtLink :to="`/event/${event.id}`" class="event-card">
    <div class="event-image">
      <img v-if="event.image" :src="event.image" :alt="event.title">
      <div v-else class="placeholder-image"></div>
      <div class="event-time">
        <span class="icon">⏰</span>
        <span>{{ timeLeft }}</span>
      </div>
    </div>
    <div class="event-content">
      <h3>{{ event.title }}</h3>
      <p>{{ event.description }}</p>
      <div class="event-meta">
        <div class="participants">
          <span class="icon">👥</span>
          <span>{{ event.participants }}</span>
        </div>
        <div class="category">
          <span class="icon">🏷️</span>
          <span>{{ event.category }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  event: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.event-card {
  display: block;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  color: inherit;
  margin-bottom: 16px;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.event-image {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-time {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.event-content {
  padding: 12px;
}

.event-content h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.event-content p {
  margin: 0 0 12px;
  font-size: 14px;
  color: #666;
  position: relative;
  max-height: 2.8em; /* تقریباً دو خط */
  line-height: 1.4em;
  overflow: hidden;
}

.event-content p::after {
  content: '...';
  position: absolute;
  bottom: 0;
  right: 0;
  background: #ffffff;
  padding: 0 4px;
}

.event-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.participants, .category {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon {
  font-size: 14px;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.placeholder-image::before {
  content: 'بدون تصویر';
}
</style>
