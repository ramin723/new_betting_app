<template>
  <div class="circular-progress" :style="{ '--progress-color': color }">
    <svg viewBox="0 0 36 36" class="circular-chart">
      <path
        d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="#eee"
        stroke-width="2"
      />
      <path
        d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        :stroke="color"
        stroke-width="2"
        :stroke-dasharray="`${percentage}, 100`"
      />
    </svg>
    <div class="percentage">{{ Math.round(percentage) }}%</div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  value: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    default: 100
  },
  color: {
    type: String,
    default: '#457B9D'
  }
});

const percentage = computed(() => {
  return (props.value / props.total) * 100;
});
</script>

<style scoped>
.circular-progress {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circular-chart {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.circular-chart path {
  transition: stroke-dasharray 0.5s ease;
}

.percentage {
  position: absolute;
  font-size: 0.8rem;
  color: var(--progress-color);
  font-weight: 500;
}
</style>
  