import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import gsap from 'gsap'

// Create Vue app
const app = createApp(App)

// Use Pinia for state management
app.use(createPinia())

// Use Vue Router for routing
app.use(router)

// Make GSAP available globally
app.config.globalProperties.$gsap = gsap

// Mount the app
app.mount('#app')
