<script setup lang="ts">
import Navigation from './Navigation.vue'
import { onMounted } from 'vue'
import { gsap } from 'gsap'

onMounted(() => {
  // Animate the content entrance
  gsap.fromTo(
    '.main-content',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
  )
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navigation />
    
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 main-content">
      <slot></slot>
    </main>
    
    <footer class="bg-white py-4 border-t border-gray-200 mt-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-gray-500 text-sm">
          &copy; {{ new Date().getFullYear() }} PawPal. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template> 