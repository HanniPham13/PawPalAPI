<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSocialStore } from '../stores/social'
import MainLayout from '../components/layouts/MainLayout.vue'
import { gsap } from 'gsap'

const socialStore = useSocialStore()
const isLoading = ref(true)
const isLoadingMore = ref(false)

// Fetch following
onMounted(async () => {
  try {
    isLoading.value = true
    await socialStore.fetchFollowing(true) // true = refresh
    
    // Animate the header
    gsap.fromTo(
      '.following-header',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    )
  } catch (error) {
    console.error('Error fetching following:', error)
  } finally {
    isLoading.value = false
  }
})

// Load more following
const loadMore = async () => {
  if (isLoadingMore.value || !socialStore.hasMoreFollowing) return
  
  isLoadingMore.value = true
  
  try {
    await socialStore.fetchFollowing()
  } catch (error) {
    console.error('Error loading more following:', error)
  } finally {
    isLoadingMore.value = false
  }
}

// Unfollow user
const unfollowUser = async (followingId: string) => {
  try {
    await socialStore.unfollowUser(followingId)
  } catch (error) {
    console.error('Error unfollowing user:', error)
  }
}
</script>

<template>
  <MainLayout>
    <div class="following-bg">
      <!-- Following header -->
      <div class="following-header mb-8 flex flex-col items-center justify-center">
        <h1 class="following-title">Following</h1>
        <p class="following-desc">People you follow</p>
      </div>
      <div class="following-card">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center my-10">
          <p class="mt-4 text-gray-600 font-semibold">Loading following...</p>
        </div>
        <!-- Empty state -->
        <div v-else-if="!socialStore.following.length" class="text-center py-12">
          <h3 class="mt-5 text-xl font-semibold text-gray-900">Not following anyone yet</h3>
          <p class="mt-2 text-gray-500">When you follow people, they'll appear here.</p>
        </div>
        <!-- Following list -->
        <div v-else class="space-y-4">
          <div 
            v-for="user in socialStore.following" 
            :key="user.id"
            class="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between"
          >
            <div class="flex items-center">
              <!-- Profile Initials Only -->
              <div class="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg mr-4">
                {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
              </div>
              <!-- User Info -->
              <div>
                <div class="flex items-center">
                  <h3 class="font-semibold text-gray-800">
                    {{ user.firstName }} {{ user.lastName }}
                  </h3>
                </div>
                <p class="text-gray-500 text-sm">@{{ user.username }}</p>
              </div>
            </div>
            <!-- Action Buttons -->
            <button 
              @click="unfollowUser(user.id)"
              class="refresh-btn text-sm py-1 px-3"
            >
              Unfollow
            </button>
          </div>
          <!-- Load more button -->
          <div v-if="socialStore.hasMoreFollowing" class="flex justify-center mt-6">
            <button 
              @click="loadMore" 
              class="refresh-btn flex items-center justify-center"
              :disabled="isLoadingMore"
            >
              {{ isLoadingMore ? 'Loading...' : 'Load More' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.following-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff 0%, #ffe0ef 100%);
  padding: 2.5rem 0 0 0;
}
.following-header {
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
.following-title {
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  letter-spacing: 0.03em;
}
.following-desc {
  font-size: 1.1rem;
  color: #b36b8a;
  margin-top: 0.2rem;
  font-weight: 500;
  text-align: center;
}
.following-card {
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
  padding: 2.5rem 2rem;
  max-width: 700px;
  margin: 0 auto 2.5rem auto;
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
@media (max-width: 640px) {
  .following-header, .following-card {
    padding: 1.2rem 0.7rem;
  }
  .following-card {
    padding: 1.2rem 0.7rem;
  }
  .following-title {
    font-size: 1.3rem;
  }
}
</style> 