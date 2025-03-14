<template>
  <div class="page-container">
    <div class="header">
      <button class="back-btn" @click="$router.push('/')">
        ← Back to Home
      </button>
      <h1>Create New Event</h1>
    </div>

    <CreateEvent 
      @submit="handleEventCreated"
      @cancel="$router.push('/')"
    />

    <!-- Success/Error Messages -->
    <div v-if="message" :class="['message', message.type]">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CreateEvent from '~/components/CreateEvent.vue';

const message = ref(null);

const handleEventCreated = (event) => {
  message.value = {
    type: 'success',
    text: `Event "${event.title}" created successfully and is pending review.`
  };

  // Clear message after 5 seconds
  setTimeout(() => {
    message.value = null;
  }, 5000);
};
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  color: #1D3557;
}

.back-btn {
  padding: 8px 16px;
  background: none;
  border: 2px solid #457B9D;
  color: #457B9D;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(69, 123, 157, 0.1);
}

.message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  animation: slideIn 0.3s ease;
}

.message.success {
  background: #4CAF50;
  color: white;
}

.message.error {
  background: #F44336;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style> 