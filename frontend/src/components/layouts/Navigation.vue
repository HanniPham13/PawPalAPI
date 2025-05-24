<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'

const authStore = useAuthStore()
const router = useRouter()
const mobileMenuOpen = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  
  if (mobileMenuOpen.value) {
    gsap.fromTo(
      '.mobile-menu',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    )
  }
}

const logout = () => {
  authStore.logout()
  router.push('/login')
  mobileMenuOpen.value = false
}
</script>

<template>
  <nav class="nav-bg">
    <div class="nav-container">
      <div class="nav-inner">
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            <span class="brand-gradient">PawPal</span>
          </router-link>
        </div>
        <!-- Desktop menu -->
        <div class="nav-links">
          <template v-if="isAuthenticated">
            <router-link to="/feed" class="nav-link" active-class="nav-link-active">Feed</router-link>
            <router-link to="/adoption-feed" class="nav-link" active-class="nav-link-active">
              <i class="fas fa-heart"></i>
              <span>Adoption</span>
            </router-link>
            <router-link to="/my-pets" class="nav-link" active-class="nav-link-active">
              <i class="fas fa-paw"></i>
              <span>My Pets</span>
            </router-link>
            <router-link to="/saved" class="nav-link" active-class="nav-link-active">Saved</router-link>
            <router-link to="/messages" class="nav-link" active-class="nav-link-active">Messages</router-link>
            <router-link to="/followers" class="nav-link" active-class="nav-link-active">Followers</router-link>
            <router-link to="/following" class="nav-link" active-class="nav-link-active">Following</router-link>
            <router-link to="/profile" class="nav-link" active-class="nav-link-active">Profile</router-link>
            <button @click="logout" class="signout-btn">Sign Out</button>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-link nav-btn-outline">Sign In</router-link>
            <router-link to="/register" class="nav-link nav-btn ml-2">Sign Up</router-link>
          </template>
        </div>
        <!-- Mobile menu button -->
        <div class="nav-mobile-btn">
          <button @click="toggleMobileMenu" class="mobile-menu-toggle">
            <span v-if="!mobileMenuOpen">☰</span>
            <span v-else>✕</span>
          </button>
        </div>
      </div>
    </div>
    <!-- Mobile menu -->
    <div v-if="mobileMenuOpen" class="mobile-menu">
      <div class="mobile-menu-links">
        <template v-if="isAuthenticated">
          <router-link to="/feed" class="mobile-link" active-class="nav-link-active" @click="mobileMenuOpen = false">Feed</router-link>
          <router-link to="/adoption-feed" class="mobile-link" active-class="nav-link-active" @click="mobileMenuOpen = false">
            <i class="fas fa-heart"></i>
            <span>Adoption</span>
          </router-link>
          <router-link to="/my-pets" class="mobile-link" active-class="nav-link-active" @click="mobileMenuOpen = false">
            <i class="fas fa-paw"></i>
            <span>My Pets</span>
          </router-link>
          <router-link to="/saved" class="mobile-link" active-class="nav-link-active" @click="mobileMenuOpen = false">Saved</router-link>
          <router-link to="/messages" class="mobile-link" active-class="nav-link-active" @click="mobileMenuOpen = false">Messages</router-link>
          <router-link to="/followers" class="mobile-link" active-class="nav-link-active" @click="mobileMenuOpen = false">Followers</router-link>
          <router-link to="/following" class="mobile-link" active-class="nav-link-active" @click="mobileMenuOpen = false">Following</router-link>
          <router-link to="/profile" class="mobile-link" active-class="nav-link-active" @click="mobileMenuOpen = false">Profile</router-link>
          <button @click="logout" class="mobile-signout">Sign Out</button>
        </template>
        <template v-else>
          <router-link to="/login" class="mobile-link" active-class="nav-link-active" @click="mobileMenuOpen = false">Sign In</router-link>
          <router-link to="/register" class="mobile-link" active-class="nav-link-active" @click="mobileMenuOpen = false">Sign Up</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav-bg {
  background: #fff;
  box-shadow: 0 4px 24px 0 rgba(255, 94, 156, 0.08);
  border-bottom-left-radius: 1.25rem;
  border-bottom-right-radius: 1.25rem;
  position: sticky;
  top: 0;
  z-index: 50;
}
.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4.5rem;
}
.nav-brand {
  display: flex;
  align-items: center;
}
.brand-link {
  text-decoration: none;
}
.brand-gradient {
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  letter-spacing: 0.03em;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.nav-link {
  padding: 0.5rem 1.1rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #22223b;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}
.nav-link:hover, .nav-link:focus, .nav-link-active {
  color: #ff5e9c;
  background: #ffe0ef;
}
.nav-link.highlight-link {
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}
.nav-link.highlight-link:hover {
  background-color: #ffe0ef;
  color: #ff5e9c !important;
}
.nav-link.highlight-link.nav-link-active {
  background-color: #ffe0ef;
  color: #ff5e9c !important;
}
.signout-btn {
  margin-left: 1rem;
  padding: 0.5rem 1.1rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #ff5e9c;
  background: #fff0f7;
  border: 1.5px solid #ff5e9c;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.signout-btn:hover, .signout-btn:focus {
  background: #ffe0ef;
  color: #d72660;
}
.nav-btn {
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  color: #fff;
  font-weight: 700;
  border: none;
  padding: 0.5rem 1.1rem;
  border-radius: 0.5rem;
  transition: background 0.2s, color 0.2s;
}
.nav-btn:hover, .nav-btn:focus {
  background: linear-gradient(90deg, #ff7eb3 0%, #ff5e9c 100%);
}
.nav-btn-outline {
  background: #fff0f7;
  color: #ff5e9c;
  border: 1.5px solid #ff5e9c;
  font-weight: 700;
  padding: 0.5rem 1.1rem;
  border-radius: 0.5rem;
  transition: background 0.2s, color 0.2s;
}
.nav-btn-outline:hover, .nav-btn-outline:focus {
  background: #ffe0ef;
  color: #d72660;
}
.nav-mobile-btn {
  display: none;
}
@media (max-width: 900px) {
  .nav-links {
    display: none;
  }
  .nav-mobile-btn {
    display: block;
  }
}
.mobile-menu {
  background: #fff;
  box-shadow: 0 4px 24px 0 rgba(255, 94, 156, 0.08);
  border-bottom-left-radius: 1.25rem;
  border-bottom-right-radius: 1.25rem;
  position: absolute;
  top: 4.5rem;
  left: 0;
  width: 100%;
  z-index: 100;
  animation: fadeIn 0.3s;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.mobile-menu-links {
  display: flex;
  flex-direction: column;
  padding: 1.2rem 1.5rem;
  gap: 0.5rem;
}
.mobile-link {
  padding: 0.7rem 1.1rem;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #22223b;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}
.mobile-link:hover, .mobile-link:focus, .nav-link-active {
  color: #ff5e9c;
  background: #ffe0ef;
}
.mobile-link.highlight-link {
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}
.mobile-link.highlight-link:hover {
  background-color: #ffe0ef;
  color: #ff5e9c !important;
}
.mobile-link.highlight-link.nav-link-active {
  background-color: #ffe0ef;
  color: #ff5e9c !important;
}
.mobile-signout {
  margin-top: 0.7rem;
  padding: 0.7rem 1.1rem;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #ff5e9c;
  background: #fff0f7;
  border: 1.5px solid #ff5e9c;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.mobile-signout:hover, .mobile-signout:focus {
  background: #ffe0ef;
  color: #d72660;
}
</style> 