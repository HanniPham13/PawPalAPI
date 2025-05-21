<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AuthLayout from '../../components/layouts/AuthLayout.vue'
import { gsap } from 'gsap'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const verificationCode = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)
const isResending = ref(false)

onMounted(() => {
  // If email was passed in route params, set it
  if (route.params.email) {
    email.value = route.params.email as string
  }
  
  // Animate the digits input
  gsap.fromTo(
    '.digit-group input',
    { scale: 0.9, opacity: 0 },
    { 
      scale: 1, 
      opacity: 1, 
      duration: 0.3, 
      stagger: 0.1, 
      ease: 'back.out(1.7)' 
    }
  )
})

const handleVerify = async () => {
  if (!email.value || !verificationCode.value) {
    errorMessage.value = 'Please enter your email and verification code'
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const result = await authStore.verifyEmail(email.value, verificationCode.value)
    
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
    errorMessage.value = 'An error occurred during verification'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const handleResendCode = async () => {
  if (!email.value) {
    errorMessage.value = 'Please enter your email address'
    return
  }
  
  isResending.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const result = await authStore.resendVerificationEmail(email.value)
    
    if (result.success) {
      successMessage.value = result.message
    } else {
      errorMessage.value = result.message
    }
  } catch (error) {
    errorMessage.value = 'An error occurred while resending the verification code'
    console.error(error)
  } finally {
    isResending.value = false
  }
}

// Handle input for the verification code
const focusNext = (event: Event, nextId: string) => {
  const input = event.target as HTMLInputElement
  
  if (input.value.length === input.maxLength) {
    const nextInput = document.getElementById(nextId) as HTMLInputElement
    if (nextInput) {
      nextInput.focus()
    }
  }
  
  updateVerificationCode()
}

const updateVerificationCode = () => {
  let code = ''
  for (let i = 1; i <= 6; i++) {
    const input = document.getElementById(`digit-${i}`) as HTMLInputElement
    code += input?.value || ''
  }
  verificationCode.value = code
}
</script>

<template>
  <AuthLayout>
    <div class="verify-card">
      <div class="brand-header">
        <span class="brand-logo">🐾</span>
        <span class="brand-title">PawPal</span>
      </div>
      <h2 class="form-title">Verify your email</h2>
      <p class="form-desc">
        We've sent a verification code to your email address.<br>
        Please enter it below to verify your account.
      </p>
      <form @submit.prevent="handleVerify" class="verify-form">
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        <div class="form-group">
          <label for="email" class="form-label">Email address</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            class="form-input" 
            placeholder="you@example.com" 
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label mb-2">Verification code</label>
          <div class="digit-group">
            <input id="digit-1" type="number" maxlength="1" autocomplete="off" class="digit-input" @input="focusNext($event, 'digit-2')" />
            <input id="digit-2" type="number" maxlength="1" autocomplete="off" class="digit-input" @input="focusNext($event, 'digit-3')" />
            <input id="digit-3" type="number" maxlength="1" autocomplete="off" class="digit-input" @input="focusNext($event, 'digit-4')" />
            <input id="digit-4" type="number" maxlength="1" autocomplete="off" class="digit-input" @input="focusNext($event, 'digit-5')" />
            <input id="digit-5" type="number" maxlength="1" autocomplete="off" class="digit-input" @input="focusNext($event, 'digit-6')" />
            <input id="digit-6" type="number" maxlength="1" autocomplete="off" class="digit-input" @input="updateVerificationCode" />
          </div>
        </div>
        <button type="submit" class="form-btn mt-4" :disabled="isLoading">
          <span v-if="isLoading" class="mr-2 spinner"></span>
          {{ isLoading ? 'Verifying...' : 'Verify email' }}
        </button>
      </form>
      <div class="divider"><span>OR</span></div>
      <div class="text-center">
        <button @click="handleResendCode" class="form-btn secondary mb-2" :disabled="isResending">
          <span v-if="isResending" class="mr-2 spinner"></span>
          {{ isResending ? 'Sending...' : 'Didn\'t receive a code? Resend' }}
        </button>
        <div class="mt-2">
          <router-link to="/login" class="login-link">Back to login</router-link>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<style scoped>
.verify-card {
  background: white;
  border-radius: 1.25rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.12);
  padding: 2.5rem 2rem 2rem 2rem;
  max-width: 420px;
  margin: 2.5rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
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
.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.7rem;
  letter-spacing: 0.02em;
  color: #22223b;
}
.form-desc {
  font-size: 1rem;
  color: #666;
  text-align: center;
  margin-bottom: 1.2rem;
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
.form-btn.secondary {
  background: #f8f9fa;
  color: #ff5e9c;
  border: 1.5px solid #ff5e9c;
  box-shadow: none;
}
.form-btn.secondary:hover, .form-btn.secondary:focus {
  background: #ffe0ef;
  color: #d72660;
}
.form-group {
  margin-bottom: 1.2rem;
  width: 100%;
}
.digit-group {
  display: flex;
  justify-content: center;
  gap: 0.7rem;
  margin-top: 0.2rem;
  margin-bottom: 0.2rem;
}
.digit-input {
  width: 48px;
  height: 56px;
  border-radius: 0.5rem;
  border: 1.5px solid #e0e0e0;
  background: #f8f9fa;
  font-size: 2rem;
  text-align: center;
  font-weight: 700;
  transition: border 0.2s, box-shadow 0.2s;
}
.digit-input:focus {
  border: 1.5px solid #ff5e9c;
  box-shadow: 0 0 0 2px #ffe0ef;
  outline: none;
  background: #fff;
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
.success-message {
  background: #e6ffed;
  color: #1a7f37;
  border-left: 4px solid #1a7f37;
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
.divider span {
  margin: 0 auto;
  color: #b0b0b0;
  font-weight: 600;
  font-size: 0.95rem;
  background: #fff;
  padding: 0 0.75rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 4px 0 rgba(31, 38, 135, 0.04);
}
.login-link {
  color: #ff5e9c;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}
.login-link:hover {
  color: #d72660;
  text-decoration: underline;
}
.spinner {
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
  border: 2.5px solid #fff;
  border-top: 2.5px solid #ff5e9c;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
/* Hide number input arrows */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
input[type=number] {
  -moz-appearance: textfield;
}
</style> 