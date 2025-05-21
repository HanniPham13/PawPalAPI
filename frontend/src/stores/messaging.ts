import { defineStore } from 'pinia'
import axios from 'axios'

interface Message {
  id: string
  content: string
  chatId: string
  senderId: string
  receiverId: string
  isRead: boolean
  createdAt: string
  sender: {
    id: string
    username: string
    firstName: string
    lastName: string
    profile: {
      profilePictureUrl: string | null
    }
  }
  receiver: {
    id: string
    username: string
    firstName: string
    lastName: string
    profile: {
      profilePictureUrl: string | null
    }
  }
  chatFile?: {
    id: string
    fileUrl: string
  }
}

interface Chat {
  id: string
  participants: {
    id: string
    userId: string
    chatId: string
    user: {
      id: string
      username: string
      firstName: string
      lastName: string
      profile: {
        profilePictureUrl: string | null
      }
    }
  }[]
  messages: Message[]
  _count: {
    messages: number
  }
}

interface MessagingState {
  chats: Chat[]
  currentChat: Chat | null
  messages: Message[]
  isLoading: boolean
  error: string | null
  hasMoreChats: boolean
  hasMoreMessages: boolean
  chatsPage: number
  messagesPage: number
}

export const useMessagingStore = defineStore('messaging', {
  state: (): MessagingState => ({
    chats: [],
    currentChat: null,
    messages: [],
    isLoading: false,
    error: null,
    hasMoreChats: true,
    hasMoreMessages: true,
    chatsPage: 1,
    messagesPage: 1
  }),
  
  getters: {
    otherParticipant: (state) => {
      if (!state.currentChat) return null
      
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id
      return state.currentChat.participants.find(p => p.user.id !== userId)?.user
    }
  },
  
  actions: {
    async fetchChats(refresh = false) {
      if (refresh) {
        this.chatsPage = 1
        this.chats = []
      }
      
      if (!this.hasMoreChats && !refresh) return
      
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`/api/chats?page=${this.chatsPage}&limit=10`)
        
        if (response.data.success) {
          if (refresh) {
            this.chats = response.data.data
          } else {
            this.chats = [...this.chats, ...response.data.data]
          }
          
          this.hasMoreChats = response.data.hasMore
          this.chatsPage++
        } else {
          this.error = response.data.message
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch chats'
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchChatMessages(chatId: string, refresh = false) {
      if (refresh) {
        this.messagesPage = 1
        this.messages = []
      }
      
      if (!this.hasMoreMessages && !refresh) return
      
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`/api/chats/${chatId}/messages?page=${this.messagesPage}&limit=20`)
        
        if (response.data.success) {
          if (refresh) {
            this.messages = response.data.data
          } else {
            this.messages = [...response.data.data, ...this.messages]
          }
          
          this.hasMoreMessages = response.data.hasMore
          this.messagesPage++
          
          // Set current chat
          const chatIndex = this.chats.findIndex(chat => chat.id === chatId)
          if (chatIndex !== -1) {
            this.currentChat = this.chats[chatIndex]
          }
        } else {
          this.error = response.data.message
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch chat messages'
      } finally {
        this.isLoading = false
      }
    },
    
    async sendMessage(chatId: string, content: string, receiverId: string, file?: File) {
      this.error = null
      
      try {
        const formData = new FormData()
        formData.append('chatId', chatId)
        formData.append('content', content)
        formData.append('receiverId', receiverId)
        
        if (file) {
          formData.append('chatFile', file)
        }
        
        const response = await axios.post('/api/messages', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        if (response.data.success) {
          // Add message to list
          this.messages.push(response.data.data)
          
          // Update chat with latest message
          const chatIndex = this.chats.findIndex(chat => chat.id === chatId)
          if (chatIndex !== -1) {
            this.chats[chatIndex].messages = [response.data.data]
            
            // Move this chat to the top
            const chat = this.chats.splice(chatIndex, 1)[0]
            this.chats.unshift(chat)
          }
          
          return { success: true, message: response.data.message, data: response.data.data }
        } else {
          this.error = response.data.message
          return { success: false, message: response.data.message }
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to send message'
        return { success: false, message: this.error }
      }
    }
  }
}) 