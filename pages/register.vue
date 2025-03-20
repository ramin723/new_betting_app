<template>
  <div class="register-container">
    <div class="register-form">
      <h1>ثبت‌نام</h1>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">نام کاربری</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            :class="{ 'error': errors.username }"
          />
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label for="email">ایمیل</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            :class="{ 'error': errors.email }"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">رمز عبور</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            :class="{ 'error': errors.password }"
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword">تکرار رمز عبور</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            :class="{ 'error': errors.confirmPassword }"
          />
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>

        <button type="submit" :disabled="loading" class="submit-btn">
          <span v-if="loading" class="spinner"></span>
          ثبت‌نام
        </button>
      </form>

      <div class="login-link">
        <p>حساب کاربری دارید؟ <NuxtLink to="/login">ورود</NuxtLink></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';

const router = useRouter();
const loading = ref(false);
const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// اسکیمای اعتبارسنجی
const registerSchema = z.object({
  username: z.string()
    .min(3, 'نام کاربری باید حداقل 3 کاراکتر باشد')
    .max(20, 'نام کاربری نمی‌تواند بیشتر از 20 کاراکتر باشد'),
  email: z.string()
    .email('ایمیل نامعتبر است'),
  password: z.string()
    .min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد')
    .regex(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد')
    .regex(/[a-z]/, 'رمز عبور باید حداقل یک حرف کوچک داشته باشد')
    .regex(/[0-9]/, 'رمز عبور باید حداقل یک عدد داشته باشد'),
  confirmPassword: z.string()
});

const validateForm = () => {
  // پاک کردن خطاهای قبلی
  Object.keys(errors).forEach(key => errors[key] = '');

  try {
    registerSchema.parse({
      username: form.username,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword
    });

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'رمز عبور و تکرار آن مطابقت ندارند';
      return false;
    }

    return true;
  } catch (error) {
    if (error.errors) {
      error.errors.forEach(err => {
        errors[err.path[0]] = err.message;
      });
    }
    return false;
  }
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;
  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        username: form.username,
        email: form.email,
        password: form.password
      }
    });

    if (response.success) {
      // ذخیره توکن
      localStorage.setItem('token', response.token);
      // هدایت به صفحه اصلی
      router.push('/');
    } else {
      errors.username = response.message || 'خطا در ثبت‌نام';
    }
  } catch (error) {
    errors.username = error.message || 'خطا در ثبت‌نام';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1D3557, #457B9D);
  padding: 20px;
}

.register-form {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  color: #1D3557;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #1D3557;
}

input {
  width: 100%;
  padding: 12px;
  border: 2px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #457B9D;
}

input.error {
  border-color: #E53E3E;
}

.error-message {
  color: #E53E3E;
  font-size: 14px;
  margin-top: 4px;
  display: block;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #457B9D;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
}

.submit-btn:hover {
  background: #1D3557;
}

.submit-btn:disabled {
  background: #A0AEC0;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #4A5568;
}

.login-link a {
  color: #457B9D;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style> 