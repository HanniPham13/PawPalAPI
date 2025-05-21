<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AuthLayout2 from '../../components/layouts/AuthLayout2.vue'

const router = useRouter()
const authStore = useAuthStore()

const userData = reactive({
  email: '',
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  address: {
    address: '',
    city: '',
    state: '',
    zipCode: '',
  },
  addAddress: false,
})

const errorMessage = ref('')
const isLoading = ref(false)

const handleRegister = async () => {
  if (!userData.email || !userData.username || !userData.password || !userData.firstName || !userData.lastName) {
    errorMessage.value = 'Please fill in all required fields.'
    return
  }
  if (userData.password.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long.'
    return
  }
  if (userData.addAddress) {
    if (!userData.address.address || !userData.address.city || !userData.address.state || !userData.address.zipCode) {
      errorMessage.value = 'Please fill in all address fields.'
      return
    }
    if (!/^\d{5}$/.test(userData.address.zipCode)) {
      errorMessage.value = 'Please provide a valid 5-digit zip code.'
      return
    }
  }
  isLoading.value = true
  errorMessage.value = ''
  try {
    const registerData = {
      email: userData.email,
      username: userData.username,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      address: userData.addAddress ? {
        address: userData.address.address,
        city: userData.address.city,
        state: userData.address.state,
        zipCode: userData.address.zipCode,
      } : undefined,
    }
    const result = await authStore.register(registerData)
    if (result.success) {
      router.push({ name: 'verify-email', params: { email: userData.email } })
    } else {
      errorMessage.value = result.message || 'Registration failed. Please try again.'
    }
  } catch (error) {
    errorMessage.value = 'An error occurred during registration'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout2>
    <div class="register-card">
      <div class="brand-header">
        <span class="brand-logo">🐾</span>
        <span class="brand-title">PawPal</span>
        </div>
      <h2 class="form-title">Sign Up</h2>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input id="email" v-model="userData.email" type="email" class="form-input" required />
          </div>
          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <input id="username" v-model="userData.username" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input id="password" v-model="userData.password" type="password" class="form-input" required />
        </div>
          <div class="form-group">
            <label for="firstName" class="form-label">First Name</label>
            <input id="firstName" v-model="userData.firstName" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label for="lastName" class="form-label">Last Name</label>
            <input id="lastName" v-model="userData.lastName" type="text" class="form-input" required />
          </div>
        </div>
        <div class="w-full mt-2 mb-2">
          <button type="button" class="form-btn mb-2" style="background: #f8f9fa; color: #ff5e9c; border: 1.5px solid #ff5e9c; box-shadow: none; font-size: 1rem; font-weight: 600;" @click="userData.addAddress = !userData.addAddress">
            {{ userData.addAddress ? 'Remove address details' : 'Add address details (optional)' }}
          </button>
        </div>
        <div v-if="userData.addAddress" class="form-grid">
          <div>
            <label for="address" class="form-label">Address</label>
            <input id="address" v-model="userData.address.address" type="text" class="form-input" />
          </div>
            <div>
            <label for="city" class="form-label">City</label>
            <input id="city" v-model="userData.address.city" type="text" class="form-input" />
            </div>
            <div>
            <label for="state" class="form-label">State</label>
            <input id="state" v-model="userData.address.state" type="text" class="form-input" />
          </div>
          <div>
            <label for="zipCode" class="form-label">Zip Code</label>
            <input id="zipCode" v-model="userData.address.zipCode" type="text" class="form-input" maxlength="5" />
          </div>
        </div>
        <button type="submit" class="form-btn mt-4" :disabled="isLoading">
          {{ isLoading ? 'Signing up...' : 'Sign Up' }}
          </button>
      </form>
      <div class="divider">
        <span>OR</span>
        </div>
      <div class="social-row">
        <button class="social-btn google" aria-label="Sign up with Google">
          <svg viewBox="0 0 24 24" class="icon"><g><path fill="#EA4335" d="M12 10.8v3.2h4.5c-.2 1.2-1.4 3.5-4.5 3.5-2.7 0-5-2.2-5-5s2.3-5 5-5c1.5 0 2.5.6 3.1 1.2l2.1-2.1C15.7 5.6 14 4.8 12 4.8 7.6 4.8 4 8.4 4 12s3.6 7.2 8 7.2c4.6 0 7.6-3.2 7.6-7.7 0-.5-.1-.9-.2-1.3H12z"/><path fill="#34A853" d="M12 21c2.4 0 4.4-.8 5.9-2.1l-2.8-2.3c-.8.5-1.8.8-3.1.8-2.4 0-4.4-1.6-5.1-3.8H4.1v2.4C5.6 19.2 8.6 21 12 21z"/><path fill="#4A90E2" d="M17.9 18.9c1.6-1.5 2.6-3.7 2.6-6.1 0-.5-.1-.9-.2-1.3H12v2.6h4.1c-.2 1.2-1.4 3.5-4.1 3.5-2.7 0-5-2.2-5-5s2.3-5 5-5c1.5 0 2.5.6 3.1 1.2l2.1-2.1C15.7 5.6 14 4.8 12 4.8 7.6 4.8 4 8.4 4 12s3.6 7.2 8 7.2c2.4 0 4.4-.8 5.9-2.1l-2.8-2.3z"/></g></svg>
        </button>
        <button class="social-btn facebook" aria-label="Sign up with Facebook">
          <svg viewBox="0 0 24 24" class="icon"><path fill="#1877F3" d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.325 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0"/></svg>
        </button>
        <button class="social-btn linkedin" aria-label="Sign up with LinkedIn">
          <svg viewBox="0 0 24 24" class="icon"><path fill="#0077B5" d="M20.447 20.452h-3.554v-5.569c0-1.327-.027-3.037-1.849-3.037-1.851 0-2.132 1.445-2.132 2.939v5.667H9.358V9h3.414v1.561h.049c.476-.899 1.637-1.849 3.37-1.849 3.602 0 4.267 2.368 4.267 5.455v6.285zM5.337 7.433c-1.144 0-2.07-.926-2.07-2.07 0-1.143.926-2.07 2.07-2.07 1.143 0 2.07.927 2.07 2.07 0 1.144-.927 2.07-2.07 2.07zm1.777 13.019H3.56V9h3.554v11.452z"/></svg>
        </button>
      </div>
      <p class="login-link">Already a user? <router-link to="/login">LOGIN</router-link></p>
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
.register-card {
  background: white;
  border-radius: 1.25rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.12);
  padding: 1.5rem 1.5rem;
  max-width: 700px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.7rem;
  letter-spacing: 0.02em;
  color: #22223b;
}
.form-label {
  font-size: 1rem;
  font-weight: 500;
  color: #22223b;
  margin-bottom: 0.3rem;
  display: block;
}
.form-input {
  width: 100%;
  padding: 0.7rem 1rem;
  border-radius: 0.5rem;
  border: 1.5px solid #e0e0e0;
  background: #f8f9fa;
  font-size: 1rem;
  transition: border 0.2s, box-shadow 0.2s;
  margin-bottom: 0;
  min-width: 0;
}
.form-input:focus {
  border: 1.5px solid #ff5e9c;
  box-shadow: 0 0 0 2px #ffe0ef;
  outline: none;
  background: #fff;
}
.form-btn {
  width: 100%;
  padding: 0.7rem 0;
  border-radius: 0.5rem;
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.04em;
  border: none;
  box-shadow: 0 4px 16px 0 rgba(255, 94, 156, 0.12);
  cursor: pointer;
  margin-top: 0.7rem;
  margin-bottom: 0.7rem;
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
}
.form-btn:hover, .form-btn:focus {
  background: linear-gradient(90deg, #ff7eb3 0%, #ff5e9c 100%);
  box-shadow: 0 6px 24px 0 rgba(255, 94, 156, 0.18);
  transform: translateY(-2px) scale(1.02);
}
.form-btn.mb-2 {
  margin-bottom: 1.2rem !important;
}
.w-full.mt-2.mb-2 {
  margin-top: 0.7rem !important;
  margin-bottom: 0.7rem !important;
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
  border: 1.5px solid #ff5e9c;
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
  color: #ff5e9c;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}
.login-link a:hover {
  color: #d72660;
  text-decoration: underline;
}
.register-form {
  width: 100%;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.4rem;
}
.form-group:not(:last-child) {
  margin-bottom: 1.2rem;
}
.form-group {
  margin-bottom: 0;
  width: 100%;
  min-width: 0;
}
@media (min-width: 640px) {
  .register-card {
    max-width: 700px;
    padding: 1.5rem 3rem;
  }
  .form-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.4rem 2.5rem;
  }
  .form-group {
    margin-bottom: 0;
    width: 100%;
    min-width: 0;
  }
}
.AuthLayout2 {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>