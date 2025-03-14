<template>
  <div class="h-64">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import type { Stats, User, Transaction } from '~/types/admin'
import { useAdmin } from '~/composables/useAdmin'

const props = defineProps<{
  data: Stats['dailyTransactions']
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const { getStats, getRecentTransactions } = useAdmin()

const stats = ref<Stats>({
  totalUsers: 0,
  activeEvents: 0,
  totalTransactions: 0,
  dailyTransactions: []
})

const users = ref<User[]>([])
const recentTransactions = ref<Transaction[]>([])

const createChart = () => {
  if (!chartRef.value) return

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.data.map(d => d.date),
      datasets: [
        {
          label: 'معاملات روزانه',
          data: props.data.map(d => d.amount),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              family: 'IRANSans'
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value.toLocaleString()} تومان`
          }
        }
      }
    }
  })
}

watch(() => props.data, () => {
  if (chart) {
    chart.destroy()
    createChart()
  }
}, { deep: true })

onMounted(async () => {
  try {
    stats.value = await getStats()
    recentTransactions.value = await getRecentTransactions()
    createChart()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})

onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})
</script> 