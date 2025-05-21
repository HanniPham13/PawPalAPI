<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useMessagingStore } from '../stores/messaging'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '../components/layouts/MainLayout.vue'
import { gsap } from 'gsap'

const messagingStore = useMessagingStore()
const route = useRoute()
const router = useRouter()
const chatId = computed(() => route.params.id as string)
const isLoading = ref(true)
const isLoadingMore = ref(false)
const isSending = ref(false)
const messageContent = ref('')
const messageFile = ref<File | null>(null)
const messageContainerRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Computed properties
const otherUser = computed(() => messagingStore.otherParticipant)
const messages = computed(() => messagingStore.messages)
const hasMore = computed(() => messagingStore.hasMoreMessages)
const currentUserId = computed(() => JSON.parse(localStorage.getItem('user') || '{}').id)

// Fetch chat messages
onMounted(async () => {
  try {
    isLoading.value = true
    await messagingStore.fetchChatMessages(chatId.value, true) // true = refresh
    
    // Scroll to bottom after messages load
    await nextTick()
    scrollToBottom()
    
    // Animate the header
    gsap.fromTo(
      '.chat-header',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    )
  } catch (error) {
    console.error('Error fetching chat messages:', error)
  } finally {
    isLoading.value = false
  }
})

// Watch for route changes to load new chat
watch(() => route.params.id, async (newId) => {
  if (newId) {
    try {
      isLoading.value = true
      await messagingStore.fetchChatMessages(newId as string, true)
      
      // Scroll to bottom after messages load
      await nextTick()
      scrollToBottom()
    } catch (error) {
      console.error('Error fetching chat messages:', error)
    } finally {
      isLoading.value = false
    }
  }
})

// Load more messages
const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value) return
  
  isLoadingMore.value = true
  
  try {
    const prevHeight = messageContainerRef.value?.scrollHeight || 0
    await messagingStore.fetchChatMessages(chatId.value)
    
    // Maintain scroll position after loading more messages
    await nextTick()
    if (messageContainerRef.value) {
      const newHeight = messageContainerRef.value.scrollHeight
      messageContainerRef.value.scrollTop = newHeight - prevHeight
    }
  } catch (error) {
    console.error('Error loading more messages:', error)
  } finally {
    isLoadingMore.value = false
  }
}

// Send message
const sendMessage = async () => {
  if ((!messageContent.value.trim() && !messageFile.value) || isSending.value) return
  
  isSending.value = true
  
  try {
    await messagingStore.sendMessage(
      chatId.value,
      messageContent.value,
      otherUser.value!.id,
      messageFile.value || undefined
    )
    
    // Clear input after sending
    messageContent.value = ''
    messageFile.value = null
    
    // Scroll to bottom after sending
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
  } finally {
    isSending.value = false
  }
}

// Handle file selection
const handleFileSelection = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    messageFile.value = input.files[0]
  }
}

// Clear selected file
const clearFile = () => {
  messageFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Select file to attach
const selectFile = () => {
  fileInputRef.value?.click()
}

// Format timestamp
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Format date for message groups
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  
  // Check if today
  if (date.toDateString() === now.toDateString()) {
    return 'Today'
  }
  
  // Check if yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  
  // Otherwise return full date
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}

// Check if we should show date separator
const shouldShowDate = (index: number) => {
  if (index === 0) return true
  
  const currentDate = new Date(messages.value[index].createdAt).toDateString()
  const prevDate = new Date(messages.value[index - 1].createdAt).toDateString()
  
  return currentDate !== prevDate
}

// Scroll to bottom of messages
const scrollToBottom = () => {
  if (messageContainerRef.value) {
    messageContainerRef.value.scrollTop = messageContainerRef.value.scrollHeight
  }
}

// Go back to messages list
const goBack = () => {
  router.push('/messages')
}
</script>

<template>
  <MainLayout>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 h-[calc(100vh-10rem)] flex flex-col">
      <!-- Chat header -->
      <div class="chat-header flex items-center justify-between py-4 border-b">
        <div class="flex items-center">
          <button 
            @click="goBack"
            class="mr-3 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div v-if="otherUser?.profile?.profilePictureUrl" class="mr-3">
            <img 
              :src="otherUser.profile.profilePictureUrl" 
              :alt="`${otherUser.firstName}'s profile`" 
              class="h-10 w-10 rounded-full object-cover"
            />
          </div>
          <div v-else-if="otherUser" class="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg mr-3">
            {{ otherUser.firstName.charAt(0) }}{{ otherUser.lastName.charAt(0) }}
          </div>
          
          <div>
            <h2 class="font-semibold text-gray-900">
              {{ otherUser?.firstName }} {{ otherUser?.lastName }}
            </h2>
            <span class="text-sm text-gray-500">@{{ otherUser?.username }}</span>
          </div>
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="flex-1 flex justify-center items-center">
        <div class="animate-bounce-slow flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          <p class="mt-2 text-gray-600">Loading messages...</p>
        </div>
      </div>
      
      <!-- Messages container -->
      <div 
        v-else
        ref="messageContainerRef"
        class="flex-1 overflow-y-auto py-4 space-y-4"
      >
        <!-- Load more button -->
        <div v-if="hasMore" class="flex justify-center mb-4">
          <button 
            @click="loadMore" 
            class="btn btn-outline-primary text-sm px-3 py-1 flex items-center justify-center"
            :disabled="isLoadingMore"
          >
            <svg v-if="isLoadingMore" class="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoadingMore ? 'Loading...' : 'Load More' }}
          </button>
        </div>
        
        <!-- Empty state -->
        <div v-if="!messages.length" class="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No messages yet</h3>
          <p class="mt-1 text-gray-500">Start a conversation by sending a message.</p>
        </div>
        
        <!-- Messages list -->
        <template v-else>
          <div v-for="(message, index) in messages" :key="message.id">
            <!-- Date separator -->
            <div v-if="shouldShowDate(index)" class="text-center my-4">
              <span class="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500">
                {{ formatDate(message.createdAt) }}
              </span>
            </div>
            
            <!-- Message -->
            <div 
              :class="[
                'max-w-[70%] rounded-lg p-3 mb-2', 
                message.senderId === currentUserId 
                  ? 'bg-primary text-white ml-auto rounded-br-none' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              ]"
            >
              <!-- File attachment -->
              <div v-if="message.chatFile" class="mb-2">
                <a 
                  :href="message.chatFile.fileUrl" 
                  target="_blank"
                  class="flex items-center p-2 bg-white bg-opacity-20 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span>Attachment</span>
                </a>
              </div>
              
              <!-- Message content -->
              <p>{{ message.content }}</p>
              
              <!-- Message timestamp -->
              <div 
                :class="[
                  'text-xs mt-1', 
                  message.senderId === currentUserId 
                    ? 'text-white text-opacity-70' 
                    : 'text-gray-500'
                ]"
              >
                {{ formatTime(message.createdAt) }}
              </div>
            </div>
          </div>
        </template>
      </div>
      
      <!-- Input area -->
      <div class="border-t py-3">
        <!-- File preview -->
        <div v-if="messageFile" class="flex items-center mb-2 p-2 bg-gray-100 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span class="text-sm truncate flex-1">{{ messageFile.name }}</span>
          <button 
            @click="clearFile"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="flex items-center">
          <button 
            @click="selectFile"
            class="text-gray-500 hover:text-gray-700 p-2"
            title="Attach file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          <input 
            ref="fileInputRef"
            type="file" 
            class="hidden" 
            @change="handleFileSelection"
          />
          
          <input 
            v-model="messageContent"
            type="text" 
            placeholder="Type a message..."
            class="flex-1 border-0 focus:ring-0 outline-none py-2 px-3"
            @keyup.enter="sendMessage"
          />
          
          <button 
            @click="sendMessage"
            class="text-primary hover:text-primary/80 p-2"
            :disabled="isSending || (!messageContent.trim() && !messageFile)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </MainLayout>
</template> 