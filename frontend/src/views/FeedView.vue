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
const newPostContent = ref('')
const isSubmittingPost = ref(false)

// Fetch initial posts
onMounted(async () => {
  try {
    isLoading.value = true
    await feedStore.fetchFeedPosts(true) // true = refresh
    
    // Animate the header
    gsap.fromTo(
      '.feed-header',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    )
    
    // Set up intersection observer for infinite scrolling
    setupIntersectionObserver()
  } catch (error) {
    console.error('Error fetching feed posts:', error)
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
    await feedStore.fetchFeedPosts()
  } catch (error) {
    console.error('Error loading more posts:', error)
  } finally {
    isLoadingMore.value = false
  }
}

// Pull to refresh functionality (would work with touch events in a real mobile app)
const handleRefresh = async () => {
  try {
    isLoading.value = true
    await feedStore.fetchFeedPosts(true)
  } catch (error) {
    console.error('Error refreshing feed:', error)
  } finally {
    isLoading.value = false
  }
}

// Create a new post
const createPost = async () => {
  if (!newPostContent.value.trim()) return
  
  isSubmittingPost.value = true
  console.log('Attempting to create a post with content:', newPostContent.value);
  
  try {
    const result = await feedStore.createPost({ content: newPostContent.value })
    console.log('Post creation result:', result);
    
    if (result.success) {
      newPostContent.value = ''
      await feedStore.fetchFeedPosts(true)
      
      // Animate the new post indicator
      gsap.fromTo(
        '.new-post-indicator',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )
      
      setTimeout(() => {
        gsap.to('.new-post-indicator', { opacity: 0, duration: 0.5 })
      }, 3000)
    } else {
      // Show error message
      const errorIndicator = document.querySelector('.error-post-indicator') as HTMLElement;
      if (errorIndicator) {
        errorIndicator.textContent = result.message || 'Failed to create post';
        gsap.fromTo(
          errorIndicator,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        )
        
        setTimeout(() => {
          gsap.to(errorIndicator, { opacity: 0, duration: 0.5 })
        }, 5000)
      }
    }
  } catch (error) {
    console.error('Error creating post:', error)
    // Show error in the UI
    const errorIndicator = document.querySelector('.error-post-indicator') as HTMLElement;
    if (errorIndicator) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      errorIndicator.textContent = errorMsg;
      gsap.fromTo(
        errorIndicator,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )
      
      setTimeout(() => {
        gsap.to(errorIndicator, { opacity: 0, duration: 0.5 })
      }, 5000)
    }
  } finally {
    isSubmittingPost.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="feed-bg">
      <!-- Feed header -->
      <div class="feed-header mb-8 flex flex-col items-center justify-center">
        <div class="brand-header mb-2">
          <span class="brand-title">PawPal Feed</span>
        </div>
        <div class="brand-subtitle">See what your friends and pets are up to!</div>
        <button 
          @click="handleRefresh"
          class="refresh-btn mt-4"
          :class="{ 'animate-spin': isLoading }"
        >
          <span v-if="!isLoading">Refresh</span>
        </button>
      </div>

      <!-- Create post card -->
      <div class="post-create-card mb-8">
        <div class="new-post-indicator mb-2 text-center text-primary font-medium" style="opacity: 0;">
          Your post was created successfully!
        </div>
        <div class="error-post-indicator mb-2 text-center text-red-500 font-medium" style="opacity: 0;">
          Error creating post.
        </div>
        <div class="post-create-inner">
          <textarea
            v-model="newPostContent"
            placeholder="What's on your mind?"
            class="post-create-textarea"
            rows="3"
          ></textarea>
          <div class="post-create-actions">
            <button
              @click="createPost"
              class="post-btn"
              :disabled="isSubmittingPost || !newPostContent.trim()"
            >
              {{ isSubmittingPost ? 'Posting...' : 'Post' }}
            </button>
          </div>
        </div>
      </div>

      <div class="feed-card">
        <!-- Loading state -->
        <div v-if="isLoading && !feedStore.posts.length" class="flex flex-col items-center justify-center my-10">
          <p class="mt-4 text-gray-600 font-semibold">Fetching the latest posts...</p>
        </div>
        <!-- Empty state -->
        <div v-else-if="!feedStore.posts.length" class="text-center py-12">
          <h3 class="mt-5 text-xl font-semibold text-gray-900">No posts yet</h3>
          <p class="mt-2 text-gray-500">Create a post or follow more people to see their posts in your feed.</p>
        </div>
        <!-- Posts list -->
        <div v-else>
          <transition-group name="fade-slide" tag="div" class="space-y-10">
            <div v-for="post in feedStore.posts" :key="post.id">
              <PostCard :post="post" />
              <div class="post-divider"></div>
            </div>
          </transition-group>
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
            <span>No more posts to load</span>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.feed-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff 0%, #ffe0ef 100%);
  padding: 2.5rem 0 0 0;
}
.feed-header, .post-create-card, .feed-card {
  max-width: 700px;
  width: 100%;
  margin: 0 auto 2rem auto;
  box-sizing: border-box;
}
.feed-header {
  padding: 2.2rem 2rem 1.2rem 2rem;
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 4px 24px 0 rgba(255, 94, 156, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}
.post-create-card {
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}
.feed-card {
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
  padding: 2.5rem 2rem;
  margin-bottom: 2.5rem;
}
.post-create-inner {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  width: 100%;
}
.post-create-textarea {
  width: 100%;
  min-height: 60px;
  max-height: 120px;
  border-radius: 0.9rem;
  border: 1.5px solid #ffe0ef;
  background: #fff0f7;
  padding: 0.9rem 1rem;
  font-size: 1rem;
  color: #3d2a3d;
  font-weight: 500;
  box-shadow: 0 2px 8px 0 rgba(255, 94, 156, 0.06);
  outline: none;
  resize: none;
  transition: border 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  display: block;
}
.post-create-textarea:focus {
  border: 2px solid #ff5e9c;
  background: #fff;
  box-shadow: 0 4px 16px 0 rgba(255, 94, 156, 0.10);
}
.post-create-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.5rem;
}
.post-btn {
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  color: white;
  border: none;
  border-radius: 0.7rem;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.6rem 1.4rem;
  transition: opacity 0.2s, transform 0.2s, background 0.2s;
  cursor: pointer;
  box-shadow: 0 2px 8px 0 rgba(255, 94, 156, 0.10);
}
.post-btn:hover:not(:disabled) {
  opacity: 0.9;
  background: linear-gradient(90deg, #ff7eb3 0%, #ff5e9c 100%);
}
.post-btn:active:not(:disabled) {
  transform: scale(0.98);
}
.post-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.brand-header {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.brand-title {
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  letter-spacing: 0.03em;
}
.brand-subtitle {
  font-size: 1.1rem;
  color: #b36b8a;
  margin-top: 0.2rem;
  font-weight: 500;
  text-align: center;
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
.post-divider {
  height: 1px;
  background: linear-gradient(90deg, #ffe0ef 0%, #fff 100%);
  margin: 2.5rem 0 2.5rem 0;
  border: none;
}
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}
@media (max-width: 640px) {
  .feed-header, .feed-card, .post-create-card {
    max-width: 98vw;
    padding: 1.2rem 0.7rem;
    margin: 0.7rem auto 1.2rem auto;
  }
  .post-create-textarea {
    font-size: 0.97rem;
    padding: 0.7rem 0.7rem;
  }
  .brand-title {
    font-size: 1.3rem;
  }
}
</style> 