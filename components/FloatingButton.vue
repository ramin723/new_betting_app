<template>
  <button class="floating-action-button" @click="handleClick">
    <span class="fab-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <span class="fab-label">{{ label }}</span>
  </button>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    default: 'Create Event'
  },
  onClick: {
    type: Function,
    required: true
  }
});

const handleClick = () => {
  props.onClick();
};
</script>

<style scoped>
.floating-action-button {
  position: fixed;
  bottom: 140px;
  right: 24px;
  height: 56px;
  padding: 0 24px;
  border-radius: 28px;
  background: linear-gradient(135deg, #1D3557, #457B9D);
  color: #F1FAEE;
  border: none;
  box-shadow: 0 4px 12px rgba(29, 53, 87, 0.25);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  font-family: 'Inter', system-ui, sans-serif;
}

.floating-action-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 20px rgba(29, 53, 87, 0.3);
  background: linear-gradient(135deg, #2B4D80, #5B8FB9);
}

.floating-action-button:active {
  transform: translateY(0) scale(0.98);
}

.fab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.fab-label {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

@keyframes slideIn {
  from {
    transform: translate(100px, 100px);
    opacity: 0;
  }
  to {
    transform: translate(0, 0);
    opacity: 1;
  }
}

.floating-action-button {
  animation: slideIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@media (max-width: 600px) {
  .floating-action-button {
    padding: 0;
    width: 56px;
    border-radius: 50%;
  }
  
  .fab-label {
    display: none;
  }
  
  .fab-icon {
    margin: 0 auto;
  }
}
</style>
  