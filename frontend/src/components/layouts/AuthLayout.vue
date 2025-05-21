<script setup lang="ts">
import { onMounted } from 'vue'
import { gsap } from 'gsap'

onMounted(() => {
  // Animate the form entrance only
  gsap.fromTo(
    '.auth-card',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
  )
})
</script>

<template>
  <div class="min-h-screen relative overflow-hidden flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
    <!-- Background gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 z-0"></div>
    
    <!-- Decorative circles -->
    <div class="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div class="absolute bottom-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div class="absolute bottom-1/2 left-1/3 w-60 h-60 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    
    <!-- Main card -->
    <div class="auth-card sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <div class="bg-white/80 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-gray-200/50">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(40px, -60px) scale(1.1);
  }
  66% {
    transform: translate(-30px, 30px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 10s infinite ease-in-out;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style> 