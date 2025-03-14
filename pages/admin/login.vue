<template>
  <div class="admin-login">
    <div class="login-card">
      <h1>ورود ادمین</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>رمز عبور:</label>
          <input 
            type="password" 
            v-model="password"
            placeholder="رمز عبور را وارد کنید"
            required
          />
        </div>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'در حال ورود...' : 'ورود' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const { adminLogin } = useAuth();
const router = useRouter();

const password = ref('');
const error = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  if (!password.value) return;
  
  isLoading.value = true;
  error.value = '';
  
  try {
    const success = await adminLogin(password.value);
    if (success) {
      router.push('/admin/events');
    } else {
      error.value = 'رمز عبور نادرست است';
    }
  } catch (e) {
    error.value = 'خطا در ورود. لطفاً دوباره تلاش کنید';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F1FAEE;
  padding: 20px;
}

.login-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  color: #1D3557;
  text-align: center;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  color: #457B9D;
  margin-bottom: 8px;
}

input {
  width: 100%;
  padding: 10px;
  border: 2px solid #A8DADC;
  border-radius: 8px;
  font-size: 16px;
}

input:focus {
  outline: none;
  border-color: #457B9D;
}

button {
  width: 100%;
  padding: 12px;
  background: #457B9D;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover:not(:disabled) {
  background: #1D3557;
}

button:disabled {
  background: #A8DADC;
  cursor: not-allowed;
}

.error {
  color: #E63946;
  text-align: center;
  margin-top: 16px;
}
</style> 