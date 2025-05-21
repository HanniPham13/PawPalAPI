<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { gsap } from 'gsap'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  // Redirect based on authentication state
  if (authStore.isAuthenticated) {
    router.push('/feed')
  } else {
    router.push('/login')
  }
  
  // Animate the home page elements
  gsap.fromTo(
    '.hero-content',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
  )
  
  gsap.fromTo(
    '.hero-image',
    { opacity: 0, scale: 0.95 },
    { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)', delay: 0.2 }
  )
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-12">
        <div class="flex-1 hero-content">
          <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
            Connect with <span class="text-primary">Pet Lovers</span> like you
          </h1>
          <p class="text-lg text-gray-600 mb-8 max-w-xl">
            PawPal is the perfect place to share adorable moments with your pets,
            connect with other pet parents, and build a community of animal lovers.
          </p>
          <div class="space-x-4">
            <button 
              @click="router.push('/login')" 
              class="btn btn-primary px-6 py-3"
            >
              Sign In
            </button>
            <button 
              @click="router.push('/register')" 
              class="btn btn-outline-primary px-6 py-3"
            >
              Create Account
            </button>
          </div>
        </div>
        
        <div class="flex-1 hero-image">
          <img 
            src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-1.2.1&auto=format&fit=crop&w=850&q=80" 
            alt="Pets" 
            class="w-full rounded-lg shadow-xl max-w-lg mx-auto"
          />
        </div>
      </div>
      
      <div class="mt-16 pt-16 border-t border-gray-100">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-12">Why Pet Lovers Choose PawPal</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white rounded-lg p-6 shadow-md">
            <div class="text-primary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Connect with Pet Lovers</h3>
            <p class="text-gray-600">
              Find and follow other pet parents who share your passion for our furry, feathered, and scaly friends.
            </p>
          </div>
          
          <div class="bg-white rounded-lg p-6 shadow-md">
            <div class="text-primary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Share Memorable Moments</h3>
            <p class="text-gray-600">
              Upload photos and videos of your pets' cutest, funniest, and most heartwarming moments.
            </p>
          </div>
          
          <div class="bg-white rounded-lg p-6 shadow-md">
            <div class="text-primary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Join the Conversation</h3>
            <p class="text-gray-600">
              Exchange stories, advice, and support with a community that cares about pets as much as you do.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 