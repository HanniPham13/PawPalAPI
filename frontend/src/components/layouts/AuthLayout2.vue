<script setup lang="ts">
import { onMounted } from 'vue'
import { gsap } from 'gsap'

onMounted(() => {
  // Animate the form entrance
  gsap.fromTo(
    '.auth-card',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
  )
})
</script>

<template>
  <div class="min-h-screen relative overflow-hidden flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 card-offset">
    <!-- Enhanced colorful background -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-100 to-sky-100 z-0"></div>
    
    <!-- Colorful decorative elements -->
    <div class="absolute top-10 right-5 w-80 h-80 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
    <div class="absolute bottom-5 left-10 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
    <div class="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

    <!-- Only the slot for the card content, no upper-left logo/title -->
    <div class="auth-card sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <div class="bg-white py-8 px-6 sm:px-10 rounded-xl shadow-2xl">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-offset {
  margin-top: 60px;
}
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.15);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.95);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 12s infinite ease-in-out;
}

.animation-delay-2000 {
  animation-delay: 2.5s;
}

.animation-delay-4000 {
  animation-delay: 5s;
}
</style> 