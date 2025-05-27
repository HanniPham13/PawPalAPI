<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Set up axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:6600'

// Set up axios interceptors for authentication
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Handle 401 responses
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      authStore.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

onMounted(async () => {
  // Check if user is authenticated
  if (authStore.isAuthenticated) {
    // Set authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${authStore.token}`
    
    // Fetch latest user profile data on app mount
    try {
      await authStore.fetchUserProfile()
      console.log('User profile loaded on app mount')
    } catch (err) {
      console.error('Failed to load user profile on app mount:', err)
    }
  }
})
</script>

<template>
  <div class="min-h-screen">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
@import './style.css';
</style>
