<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AuthLayout2 from '../../components/layouts/AuthLayout2.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleLogin = async (): Promise<void> => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields'
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const result = await authStore.login(email.value, password.value)
    
    if (result.success) {
      router.push('/feed')
    } else {
      errorMessage.value = 'Failed to sign in. Please try again.'
    }
  } catch (error) {
    errorMessage.value = 'An error occurred during login'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout2>
    <div class="login-card">
      <div class="brand-header">
        <span class="brand-logo">🐾</span>
        <span class="brand-title">PawPal</span>
      </div>
      <h2 class="form-title">Sign In</h2>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="form-label">Email</label>
          <input id="email" v-model="email" type="email" class="form-input" required />
        </div>
        <div>
          <div class="flex justify-between items-center mb-1">
            <label for="password" class="form-label">Password</label>
            <router-link to="/forgot-password" class="forgot-link">Forgot password?</router-link>
          </div>
          <input id="password" v-model="password" type="password" class="form-input" required />
        </div>
        <button type="submit" class="form-btn" :disabled="isLoading">
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
      <p class="login-link">Don't have an account? <router-link to="/register">Sign up</router-link></p>
    </div>
  </AuthLayout2>
</template>

<style scoped>
.brand-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}
.brand-logo {
  font-size: 2.2rem;
  color: #ff5e9c;
  margin-right: 0.5rem;
}
.brand-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  letter-spacing: 0.03em;
}
.login-card {
  background: white;
  border-radius: 1.25rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.12);
  padding: 2.5rem 2rem;
  max-width: 380px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.form-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1.5rem;
  letter-spacing: 0.02em;
  color: #22223b;
}
.form-label {
  font-size: 1rem;
  font-weight: 500;
  color: #22223b;
  margin-bottom: 0.25rem;
  display: block;
}
.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1.5px solid #e0e0e0;
  background: #f8f9fa;
  font-size: 1rem;
  transition: border 0.2s, box-shadow 0.2s;
  margin-bottom: 0.5rem;
}
.form-input:focus {
  border: 1.5px solid #ff5e9c;
  box-shadow: 0 0 0 2px #ffe0ef;
  outline: none;
  background: #fff;
}
.form-btn {
  width: 100%;
  padding: 0.75rem 0;
  border-radius: 0.5rem;
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.04em;
  border: none;
  box-shadow: 0 4px 16px 0 rgba(255, 94, 156, 0.12);
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
}
.form-btn:hover, .form-btn:focus {
  background: linear-gradient(90deg, #ff7eb3 0%, #ff5e9c 100%);
  box-shadow: 0 6px 24px 0 rgba(255, 94, 156, 0.18);
  transform: translateY(-2px) scale(1.02);
}
.error-message {
  background: #ffe0ef;
  color: #d72660;
  border-left: 4px solid #ff5e9c;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
  text-align: center;
  font-size: 1rem;
}
.login-link {
  text-align: center;
  font-size: 1rem;
  color: #22223b;
  margin-top: 0.5rem;
}
.login-link a {
  color: #ff5e9c;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}
.login-link a:hover {
  color: #d72660;
  text-decoration: underline;
}
.forgot-link {
  color: #ff5e9c;
  font-size: 0.98rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.forgot-link:hover {
  color: #d72660;
  text-decoration: underline;
}
</style> 