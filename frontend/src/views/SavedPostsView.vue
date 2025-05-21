<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useFeedStore } from '../stores/feed'
import MainLayout from '../components/layouts/MainLayout.vue'
import PostCard from '../components/social/PostCard.vue'
import { gsap } from 'gsap'

const feedStore = useFeedStore()
const isLoading = ref(true)
const isLoadingMore = ref(false)
const observer = ref<IntersectionObserver | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)

// Fetch initial saved posts
onMounted(async () => {
  try {
    isLoading.value = true
    await feedStore.fetchSavedPosts(true) // true = refresh
    
    // Animate the header
    gsap.fromTo(
      '.saved-header',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    )
    
    // Set up intersection observer for infinite scrolling
    setupIntersectionObserver()
  } catch (error) {
    console.error('Error fetching saved posts:', error)
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  // Clean up intersection observer
  if (observer.value) {
    observer.value.disconnect()
  }
})

// Set up intersection observer for infinite scrolling
const setupIntersectionObserver = () => {
  observer.value = new IntersectionObserver(async (entries) => {
    const entry = entries[0]
    
    if (entry.isIntersecting && !isLoadingMore.value && feedStore.hasMore) {
      await loadMorePosts()
    }
  }, { threshold: 0.5 })
  
  if (loadMoreTrigger.value) {
    observer.value.observe(loadMoreTrigger.value)
  }
}

// Load more posts when scrolling down
const loadMorePosts = async () => {
  if (isLoadingMore.value || !feedStore.hasMore) return
  
  isLoadingMore.value = true
  
  try {
    await feedStore.fetchSavedPosts()
  } catch (error) {
    console.error('Error loading more saved posts:', error)
  } finally {
    isLoadingMore.value = false
  }
}

// Pull to refresh functionality
const handleRefresh = async () => {
  try {
    isLoading.value = true
    await feedStore.fetchSavedPosts(true)
  } catch (error) {
    console.error('Error refreshing saved posts:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="saved-bg">
      <!-- Saved posts header -->
      <div class="saved-header mb-8 flex flex-col items-center justify-center">
        <h1 class="saved-title">Saved Posts</h1>
        <button 
          @click="handleRefresh"
          class="refresh-btn mt-4"
          :class="{ 'animate-spin': isLoading }"
        >
          <span v-if="!isLoading">Refresh</span>
        </button>
      </div>
      <div class="saved-card">
        <!-- Loading state -->
        <div v-if="isLoading && !feedStore.savedPosts.length" class="flex flex-col items-center justify-center my-10">
          <p class="mt-4 text-gray-600 font-semibold">Loading saved posts...</p>
        </div>
        <!-- Empty state -->
        <div v-else-if="!feedStore.savedPosts.length" class="text-center py-12">
          <h3 class="mt-5 text-xl font-semibold text-gray-900">No saved posts yet</h3>
          <p class="mt-2 text-gray-500">Posts you save will appear here.</p>
        </div>
        <!-- Posts list -->
        <div v-else>
          <div class="space-y-10">
            <PostCard 
              v-for="post in feedStore.savedPosts" 
              :key="post.id" 
              :post="post"
            />
          </div>
          <!-- Loading more indicator -->
          <div 
            v-if="feedStore.hasMore" 
            ref="loadMoreTrigger" 
            class="flex justify-center my-8"
          >
            <div v-if="isLoadingMore" class="flex items-center space-x-2 text-gray-600">
              <span>Loading more posts...</span>
            </div>
            <div v-else class="h-4"></div>
          </div>
          <!-- End of feed -->
          <div v-else class="text-center py-8 text-gray-400 text-base flex flex-col items-center">
            <span>No more saved posts to load</span>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.saved-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff 0%, #ffe0ef 100%);
  padding: 2.5rem 0 0 0;
}
.saved-header {
  max-width: 700px;
  margin: 0 auto 2rem auto;
  padding: 2.2rem 2rem 1.2rem 2rem;
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 4px 24px 0 rgba(255, 94, 156, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.saved-title {
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  letter-spacing: 0.03em;
}
.refresh-btn {
  background: #fff0f7;
  color: #ff5e9c;
  border: 1.5px solid #ff5e9c;
  border-radius: 0.7rem;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 0.6rem 1.4rem;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px 0 rgba(255, 94, 156, 0.10);
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
}
.refresh-btn:hover, .refresh-btn:focus {
  background: #ffe0ef;
  color: #d72660;
}
.saved-card {
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
  padding: 2.5rem 2rem;
  max-width: 700px;
  margin: 0 auto 2.5rem auto;
}
@media (max-width: 640px) {
  .saved-header, .saved-card {
    padding: 1.2rem 0.7rem;
  }
  .saved-card {
    padding: 1.2rem 0.7rem;
  }
  .saved-title {
    font-size: 1.3rem;
  }
}
</style> 