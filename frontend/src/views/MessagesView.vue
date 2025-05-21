<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessagingStore } from '../stores/messaging'
import { useRouter } from 'vue-router'
import MainLayout from '../components/layouts/MainLayout.vue'
import { gsap } from 'gsap'

const messagingStore = useMessagingStore()
const router = useRouter()
const isLoading = ref(true)
const isLoadingMore = ref(false)

// Fetch chats
onMounted(async () => {
  try {
    isLoading.value = true
    await messagingStore.fetchChats(true) // true = refresh
    
    // Animate the header
    gsap.fromTo(
      '.messages-header',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    )
  } catch (error) {
    console.error('Error fetching chats:', error)
  } finally {
    isLoading.value = false
  }
})

// Load more chats
const loadMore = async () => {
  if (isLoadingMore.value || !messagingStore.hasMoreChats) return
  
  isLoadingMore.value = true
  
  try {
    await messagingStore.fetchChats()
  } catch (error) {
    console.error('Error loading more chats:', error)
  } finally {
    isLoadingMore.value = false
  }
}

// Navigate to chat
const openChat = (chatId: string) => {
  router.push(`/chat/${chatId}`)
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  
  // Same day, show time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  // Within a week, show day name
  const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff < 7) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }
  
  // Older, show date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

// Get the other user in a chat
const getOtherUser = (chat: any) => {
  const userId = JSON.parse(localStorage.getItem('user') || '{}').id
  return chat.participants.find((p: any) => p.user.id !== userId)?.user
}

// Get unread count for a chat
const getUnreadCount = (chat: any) => {
  return chat._count.messages || 0
}

// Get last message preview
const getLastMessagePreview = (chat: any) => {
  if (!chat.messages || !chat.messages.length) return 'No messages yet'
  
  const lastMessage = chat.messages[0]
  if (lastMessage.chatFile) {
    return 'Sent a file'
  }
  
  return lastMessage.content || 'Empty message'
}
</script>

<template>
  <MainLayout>
    <div class="messages-bg">
      <!-- Messages header -->
      <div class="messages-header mb-8 flex flex-col items-center justify-center">
        <h1 class="messages-title">Messages</h1>
        <p class="messages-desc">Your conversations</p>
      </div>
      <div class="messages-card">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center my-10">
          <p class="mt-4 text-gray-600 font-semibold">Loading chats...</p>
        </div>
        <!-- Empty state -->
        <div v-else-if="!messagingStore.chats.length" class="text-center py-12">
          <h3 class="mt-5 text-xl font-semibold text-gray-900">No messages yet</h3>
          <p class="mt-2 text-gray-500">Start a conversation with another user.</p>
        </div>
        <!-- Chats list -->
        <div v-else class="space-y-2">
          <div 
            v-for="chat in messagingStore.chats" 
            :key="chat.id"
            @click="openChat(chat.id)"
            class="bg-white p-4 rounded-lg shadow-sm flex items-center cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          >
            <div class="flex items-center flex-1 min-w-0">
              <!-- Profile Initials Only -->
              <div class="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg mr-4 flex-shrink-0">
                {{ getOtherUser(chat)?.firstName.charAt(0) }}{{ getOtherUser(chat)?.lastName.charAt(0) }}
              </div>
              <!-- Chat Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-gray-800 truncate">
                    {{ getOtherUser(chat)?.firstName }} {{ getOtherUser(chat)?.lastName }}
                  </h3>
                  <span class="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {{ chat.messages && chat.messages.length ? formatDate(chat.messages[0].createdAt) : '' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <p class="text-gray-500 text-sm truncate">
                    {{ getLastMessagePreview(chat) }}
                  </p>
                  <!-- Unread badge -->
                  <span 
                    v-if="getUnreadCount(chat) > 0" 
                    class="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full flex-shrink-0"
                  >
                    {{ getUnreadCount(chat) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <!-- Load more button -->
          <div v-if="messagingStore.hasMoreChats" class="flex justify-center mt-6">
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
.messages-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff 0%, #ffe0ef 100%);
  padding: 2.5rem 0 0 0;
}
.messages-header {
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
.messages-title {
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  letter-spacing: 0.03em;
}
.messages-desc {
  font-size: 1.1rem;
  color: #b36b8a;
  margin-top: 0.2rem;
  font-weight: 500;
  text-align: center;
}
.messages-card {
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
  .messages-header, .messages-card {
    padding: 1.2rem 0.7rem;
  }
  .messages-card {
    padding: 1.2rem 0.7rem;
  }
  .messages-title {
    font-size: 1.3rem;
  }
}
</style> 