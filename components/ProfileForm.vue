<template>
  <div class="profile-form">
    <div class="avatar-section">
      <img 
        :src="user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`" 
        :alt="user.username" 
        class="avatar" 
      />
      <div class="avatar-actions">
        <label for="avatar-upload" class="btn btn-primary">
          تغییر تصویر
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleAvatarUpload"
        />
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="username">نام کاربری</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          class="form-control"
          disabled
        />
      </div>

      <div class="form-group">
        <label for="email">ایمیل</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-control"
          :class="{ 'is-invalid': errors.email }"
        />
        <div v-if="errors.email" class="invalid-feedback">
          {{ errors.email }}
        </div>
      </div>

      <div class="form-group">
        <label for="first_name">نام</label>
        <input
          id="first_name"
          v-model="form.first_name"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.first_name }"
        />
        <div v-if="errors.first_name" class="invalid-feedback">
          {{ errors.first_name }}
        </div>
      </div>

      <div class="form-group">
        <label for="last_name">نام خانوادگی</label>
        <input
          id="last_name"
          v-model="form.last_name"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.last_name }"
        />
        <div v-if="errors.last_name" class="invalid-feedback">
          {{ errors.last_name }}
        </div>
      </div>

      <div class="form-group">
        <label for="telegram_id">شناسه تلگرام</label>
        <input
          id="telegram_id"
          v-model="form.telegram_id"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.telegram_id }"
        />
        <div v-if="errors.telegram_id" class="invalid-feedback">
          {{ errors.telegram_id }}
        </div>
      </div>

      <div class="form-group">
        <label for="wallet_address">آدرس کیف پول</label>
        <input
          id="wallet_address"
          v-model="form.wallet_address"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.wallet_address }"
        />
        <div v-if="errors.wallet_address" class="invalid-feedback">
          {{ errors.wallet_address }}
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'در حال ذخیره...' : 'ذخیره تغییرات' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
/// <reference lib="dom" />
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';

const props = defineProps<{
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar: string;
    telegram_id: string;
    wallet_address: string;
  };
}>();

const emit = defineEmits<{
  (e: 'update:user', user: any): void;
}>();

const toast = useToast();
const loading = ref(false);
const errors = ref<Record<string, string>>({});

const form = ref({
  username: props.user.username,
  email: props.user.email,
  first_name: props.user.first_name,
  last_name: props.user.last_name,
  telegram_id: props.user.telegram_id,
  wallet_address: props.user.wallet_address
});

async function handleAvatarUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    loading.value = true;
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch('/api/profile/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('خطا در آپلود تصویر');
    }

    const data = await response.json();
    emit('update:user', { ...props.user, avatar: data.avatar });
    toast.success('تصویر پروفایل با موفقیت به‌روزرسانی شد');
  } catch (error: any) {
    toast.error(error.message || 'خطا در آپلود تصویر');
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  try {
    loading.value = true;
    errors.value = {};

    const response = await fetch('/api/profile/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(form.value)
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'خطا در به‌روزرسانی پروفایل');
    }

    const data = await response.json();
    emit('update:user', data.user);
    toast.success('پروفایل با موفقیت به‌روزرسانی شد');
  } catch (error: any) {
    toast.error(error.message || 'خطا در به‌روزرسانی پروفایل');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  form.value = {
    username: props.user.username,
    email: props.user.email,
    first_name: props.user.first_name,
    last_name: props.user.last_name,
    telegram_id: props.user.telegram_id,
    wallet_address: props.user.wallet_address
  };
});
</script>

<style scoped>
.profile-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.avatar-section {
  text-align: center;
  margin-bottom: 2rem;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
}

.avatar-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.form {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  margin-top: 2rem;
  text-align: center;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: #fff;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.hidden {
  display: none;
}
</style> 