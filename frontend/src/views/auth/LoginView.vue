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
      <div class="divider">
        <span>OR</span>
      </div>
      <div class="social-row">
        <button class="social-btn google" aria-label="Sign in with Google">
          <svg viewBox="0 0 24 24" class="icon"><g><path fill="#EA4335" d="M12 10.8v3.2h4.5c-.2 1.2-1.4 3.5-4.5 3.5-2.7 0-5-2.2-5-5s2.3-5 5-5c1.5 0 2.5.6 3.1 1.2l2.1-2.1C15.7 5.6 14 4.8 12 4.8 7.6 4.8 4 8.4 4 12s3.6 7.2 8 7.2c4.6 0 7.6-3.2 7.6-7.7 0-.5-.1-.9-.2-1.3H12z"/><path fill="#34A853" d="M12 21c2.4 0 4.4-.8 5.9-2.1l-2.8-2.3c-.8.5-1.8.8-3.1.8-2.4 0-4.4-1.6-5.1-3.8H4.1v2.4C5.6 19.2 8.6 21 12 21z"/><path fill="#4A90E2" d="M17.9 18.9c1.6-1.5 2.6-3.7 2.6-6.1 0-.5-.1-.9-.2-1.3H12v2.6h4.1c-.2 1.2-1.4 3.5-4.1 3.5-2.7 0-5-2.2-5-5s2.3-5 5-5c1.5 0 2.5.6 3.1 1.2l2.1-2.1C15.7 5.6 14 4.8 12 4.8 7.6 4.8 4 8.4 4 12s3.6 7.2 8 7.2c2.4 0 4.4-.8 5.9-2.1l-2.8-2.3z"/></g></svg>
        </button>
        <button class="social-btn facebook" aria-label="Sign in with Facebook">
          <svg viewBox="0 0 24 24" class="icon"><path fill="#1877F3" d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.325 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0"/></svg>
        </button>
        <button class="social-btn linkedin" aria-label="Sign in with LinkedIn">
          <svg viewBox="0 0 24 24" class="icon"><path fill="#0077B5" d="M20.447 20.452h-3.554v-5.569c0-1.327-.027-3.037-1.849-3.037-1.851 0-2.132 1.445-2.132 2.939v5.667H9.358V9h3.414v1.561h.049c.476-.899 1.637-1.849 3.37-1.849 3.602 0 4.267 2.368 4.267 5.455v6.285zM5.337 7.433c-1.144 0-2.07-.926-2.07-2.07 0-1.143.926-2.07 2.07-2.07 1.143 0 2.07.927 2.07 2.07 0 1.144-.927 2.07-2.07 2.07zm1.777 13.019H3.56V9h3.554v11.452z"/></svg>
        </button>
      </div>
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
  color: #5e72ff;
  margin-right: 0.5rem;
}
.brand-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(90deg, #5e72ff 0%, #7f53ff 100%);
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
  border: 1.5px solid #5e72ff;
  box-shadow: 0 0 0 2px #e0e7ff;
  outline: none;
  background: #fff;
}
.form-btn {
  width: 100%;
  padding: 0.75rem 0;
  border-radius: 0.5rem;
  background: linear-gradient(90deg, #5e72ff 0%, #7f53ff 100%);
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.04em;
  border: none;
  box-shadow: 0 4px 16px 0 rgba(94, 114, 255, 0.12);
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
}
.form-btn:hover, .form-btn:focus {
  background: linear-gradient(90deg, #7f53ff 0%, #5e72ff 100%);
  box-shadow: 0 6px 24px 0 rgba(94, 114, 255, 0.18);
  transform: translateY(-2px) scale(1.02);
}
.error-message {
  background: #e0e7ff;
  color: #3d2c8d;
  border-left: 4px solid #5e72ff;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
  text-align: center;
  font-size: 1rem;
}
.divider {
  width: 100%;
  display: flex;
  align-items: center;
  margin: 1.5rem 0 1rem 0;
}
.divider hr {
  flex: 1;
  border: none;
  border-top: 1.5px solid #e0e0e0;
  margin: 0;
}
.divider span {
  margin: 0 1rem;
  color: #b0b0b0;
  font-weight: 600;
  font-size: 0.95rem;
  background: #fff;
  padding: 0 0.75rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 4px 0 rgba(31, 38, 135, 0.04);
}
.social-row {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  margin-bottom: 1.2rem;
}
.social-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f8f9fa;
  border: 1.5px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s, border 0.2s, transform 0.1s;
  box-shadow: 0 2px 8px 0 rgba(31, 38, 135, 0.06);
  cursor: pointer;
}
.social-btn:hover {
  box-shadow: 0 4px 16px 0 rgba(31, 38, 135, 0.12);
  border: 1.5px solid #5e72ff;
  transform: scale(1.08);
}
.icon {
  width: 24px;
  height: 24px;
  display: block;
}
.login-link {
  text-align: center;
  font-size: 1rem;
  color: #22223b;
  margin-top: 0.5rem;
}
.login-link a {
  color: #5e72ff;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}
.login-link a:hover {
  color: #3d2c8d;
  text-decoration: underline;
}
.forgot-link {
  color: #5e72ff;
  font-size: 0.98rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.forgot-link:hover {
  color: #3d2c8d;
  text-decoration: underline;
}
</style> 