<template>
  <div class="max-w-2xl mx-auto p-6">
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold mb-6">Two-Factor Authentication</h2>

      <!-- 2FA Status -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold">Status</h3>
            <p class="text-gray-600">
              {{ is2FAEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled' }}
            </p>
          </div>
          <button
            v-if="!is2FAEnabled"
            @click="setup2FA"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Enable 2FA
          </button>
        </div>
      </div>

      <!-- 2FA Setup -->
      <div v-if="showSetup" class="mb-6">
        <div class="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 class="font-semibold mb-2">Setup Instructions:</h3>
          <ol class="list-decimal list-inside space-y-2">
            <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
            <li>Scan the QR code below with your authenticator app</li>
            <li>Enter the 6-digit code from your authenticator app</li>
          </ol>
        </div>

        <div class="flex justify-center mb-4">
          <img v-if="qrCode" :src="qrCode" alt="2FA QR Code" class="w-48 h-48" />
        </div>

        <div class="flex items-center space-x-4">
          <input
            v-model="verificationCode"
            type="text"
            placeholder="Enter 6-digit code"
            class="flex-1 px-4 py-2 border rounded"
            maxlength="6"
          />
          <button
            @click="verifyAndEnable"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Verify & Enable
          </button>
        </div>
      </div>

      <!-- 2FA Verification -->
      <div v-if="is2FAEnabled" class="mb-6">
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-semibold mb-2">Test 2FA:</h3>
          <div class="flex items-center space-x-4">
            <input
              v-model="testCode"
              type="text"
              placeholder="Enter 6-digit code"
              class="flex-1 px-4 py-2 border rounded"
              maxlength="6"
            />
            <button
              @click="test2FA"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminAuth } from '~/composables/useAdminAuth'
import QRCode from 'qrcode'

definePageMeta({
  middleware: ['auth', 'admin'],
  meta: {
    permission: 'manage_own_profile'
  }
})

const { setup2FA: setup2FAComposable, verify2FA, is2FAEnabled, user } = useAdminAuth()
const showSetup = ref(false)
const qrCode = ref<string | null>(null)
const verificationCode = ref('')
const testCode = ref('')

const setup2FA = async () => {
  const secret = await setup2FAComposable()
  if (secret) {
    showSetup.value = true
    // Generate QR code
    qrCode.value = await QRCode.toDataURL(`otpauth://totp/MeemBet:${user.value?.email}?secret=${secret}&issuer=MeemBet`)
  }
}

const verifyAndEnable = async () => {
  const isValid = await verify2FA(verificationCode.value)
  if (isValid) {
    showSetup.value = false
    // Show success message
  }
}

const test2FA = async () => {
  const isValid = await verify2FA(testCode.value)
  if (isValid) {
    // Show success message
  }
}

onMounted(async () => {
  // Check if 2FA is already enabled
  if (is2FAEnabled.value) {
    showSetup.value = false
  }
})
</script> 