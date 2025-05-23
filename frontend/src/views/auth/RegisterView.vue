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