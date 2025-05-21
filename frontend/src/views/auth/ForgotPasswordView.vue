<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import AuthLayout from '../../components/layouts/AuthLayout.vue'

const authStore = useAuthStore()

const email = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const handleResetRequest = async () => {
  if (!email.value) {
    errorMessage.value = 'Please enter your email address'
    return
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Please enter a valid email address'
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const result = await authStore.requestPasswordReset(email.value)
    
    if (result.success) {
      successMessage.value = result.message
    } else {
      errorMessage.value = result.message
    }
  } catch (error) {
    errorMessage.value = 'An error occurred while requesting password reset'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div>
      <h2 class="text-center text-2xl font-bold text-gray-800 mb-6">Reset your password</h2>
      <p class="text-center text-gray-600 mb-8">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      <form @submit.prevent="handleResetRequest" class="space-y-6">
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          {{ errorMessage }}
        </div>
        
        <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4">
          {{ successMessage }}
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            class="input" 
            placeholder="you@example.com" 
            required
          />
        </div>
        
        <div>
          <button 
            type="submit" 
            class="w-full btn btn-primary py-3 flex items-center justify-center"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="mr-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? 'Sending...' : 'Send reset link' }}
          </button>
        </div>
      </form>
      
      <div class="mt-6">
        <div class="text-center">
          <router-link to="/login" class="text-gray-600 hover:text-gray-800 text-sm">
            Back to login
          </router-link>
        </div>
      </div>
    </div>
  </AuthLayout>
</template> 