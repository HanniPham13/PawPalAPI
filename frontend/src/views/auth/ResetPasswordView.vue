<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AuthLayout from '../../components/layouts/AuthLayout.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

onMounted(() => {
  // Check if email and token are in URL query parameters
  if (route.query.email) {
    email.value = route.query.email as string
  }
  
  if (route.query.token) {
    token.value = route.query.token as string
  }
})

const validateForm = () => {
  if (!email.value || !token.value || !newPassword.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in all fields'
    return false
  }
  
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return false
  }
  
  if (newPassword.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long'
    return false
  }
  
  return true
}

const handleResetPassword = async () => {
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const result = await authStore.resetPassword(email.value, token.value, newPassword.value)
    
    if (result.success) {
      successMessage.value = result.message
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      errorMessage.value = result.message
    }
  } catch (error) {
    errorMessage.value = 'An error occurred while resetting your password'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div>
      <h2 class="text-center text-2xl font-bold text-gray-800 mb-6">Set new password</h2>
      <p class="text-center text-gray-600 mb-8">
        Enter a new password for your account.
      </p>
      
      <form @submit.prevent="handleResetPassword" class="space-y-6">
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
          <label for="token" class="block text-sm font-medium text-gray-700">Reset token</label>
          <input 
            id="token" 
            v-model="token" 
            type="text" 
            class="input" 
            required
          />
        </div>
        
        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-700">New password</label>
          <input 
            id="newPassword" 
            v-model="newPassword" 
            type="password" 
            class="input" 
            placeholder="••••••••" 
            required
          />
        </div>
        
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm new password</label>
          <input 
            id="confirmPassword" 
            v-model="confirmPassword" 
            type="password" 
            class="input" 
            placeholder="••••••••" 
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
            {{ isLoading ? 'Resetting password...' : 'Reset password' }}
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