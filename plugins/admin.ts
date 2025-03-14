import { useAdminAuth } from '~/composables/useAdminAuth'

export default defineNuxtPlugin(async () => {
  const { initialize } = useAdminAuth()
  
  // Initialize admin auth when the app starts
  await initialize()
}) 