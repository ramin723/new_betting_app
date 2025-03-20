<template>
  <div class="profile-page">
    <div class="container">
      <h1 class="page-title">پروفایل کاربری</h1>
      
      <div v-if="loading" class="loading">
        در حال بارگذاری...
      </div>
      
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      
      <div v-else>
        <ProfileForm
          v-model:user="user"
          @update:user="handleUserUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import ProfileForm from '~/components/ProfileForm.vue';

const router = useRouter();
const toast = useToast();

const user = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);

async function fetchUserProfile() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const response = await fetch('/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      throw new Error('خطا در دریافت اطلاعات پروفایل');
    }

    user.value = await response.json();
  } catch (err: any) {
    error.value = err.message || 'خطا در دریافت اطلاعات پروفایل';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
}

function handleUserUpdate(updatedUser: any) {
  user.value = updatedUser;
}

onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-title {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 2rem;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error {
  color: #dc3545;
}
</style> 