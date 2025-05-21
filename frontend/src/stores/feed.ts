import { defineStore } from 'pinia'
import axios from 'axios'

interface Post {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    username: string
    firstName: string
    lastName: string
    verificationLevel: string
    profile: {
      profilePictureUrl: string | null
    }
  }
  SocialPostImage: {
    id: string
    imageUrl: string
  }[]
  taggedPets: {
    id: string
    name: string
    profilePicture: string | null
  }[]
  _count: {
    reactions: number
    comments: number
  }
  reactions: any[]
  engagementScore?: number
  isVerified?: boolean
  isFollowing?: boolean
}

interface FeedState {
  posts: Post[]
  savedPosts: Post[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  page: number
}

interface CreatePostData {
  content: string
  images?: File[]
  taggedPetIds?: string[]
}

export const useFeedStore = defineStore('feed', {
  state: (): FeedState => ({
    posts: [],
    savedPosts: [],
    isLoading: false,
    error: null,
    hasMore: true,
    page: 1
  }),
  
  actions: {
    async fetchFeedPosts(refresh = false) {
      if (refresh) {
        this.page = 1
        this.posts = []
      }
      
      if (!this.hasMore && !refresh) return
      
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`/api/feed?page=${this.page}&limit=10`)
        
        if (response.data.success) {
          if (refresh) {
            this.posts = response.data.data
          } else {
            this.posts = [...this.posts, ...response.data.data]
          }
          
          this.hasMore = response.data.hasMore
          this.page++
        } else {
          this.error = response.data.message
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch feed posts'
      } finally {
        this.isLoading = false
      }
    },
    
    async createPost(postData: CreatePostData) {
      try {
        console.log('Creating post with data:', postData);
        // Create form data if we have images
        let data: FormData | CreatePostData;
        
        if (postData.images && postData.images.length > 0) {
          data = new FormData()
          // Use type assertion to tell TypeScript that data is FormData
          const formData = data as FormData;
          formData.append('content', postData.content)
          
          postData.images.forEach((image, index) => {
            formData.append(`images`, image)
          })
          
          if (postData.taggedPetIds && postData.taggedPetIds.length > 0) {
            postData.taggedPetIds.forEach(petId => {
              formData.append('taggedPetIds[]', petId)
            })
          }
        } else {
          data = postData
        }
        
        console.log('Sending request to:', axios.defaults.baseURL + '/api/user/posts');
        const response = await axios.post('/api/user/posts', data, {
          headers: postData.images ? {
            'Content-Type': 'multipart/form-data'
          } : undefined
        })
        
        console.log('Post creation response:', response.data);
        if (response.data.success) {
          return { success: true, message: response.data.message, data: response.data.data }
        } else {
          console.error('Post creation failed:', response.data.message);
          return { success: false, message: response.data.message }
        }
      } catch (error: any) {
        console.error('Error creating post:', error);
        console.error('Error details:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || 'Failed to create post' }
      }
    },
    
    async fetchSavedPosts(refresh = false) {
      if (refresh) {
        this.page = 1
        this.savedPosts = []
      }
      
      if (!this.hasMore && !refresh) return
      
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`/api/saved?page=${this.page}&limit=10`)
        
        if (response.data.success) {
          if (refresh) {
            this.savedPosts = response.data.data
          } else {
            this.savedPosts = [...this.savedPosts, ...response.data.data]
          }
          
          this.hasMore = response.data.hasMore
          this.page++
        } else {
          this.error = response.data.message
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch saved posts'
      } finally {
        this.isLoading = false
      }
    },
    
    async addReaction(postId: string, reactionType: string) {
      try {
        const response = await axios.post('/api/reactions', { postId, reactionType })
        
        if (response.data.success) {
          // Update post in the posts array
          const postIndex = this.posts.findIndex(post => post.id === postId)
          
          if (postIndex !== -1) {
            // Find if user already reacted
            const existingReactionIndex = this.posts[postIndex].reactions.findIndex(
              reaction => reaction.user?.id === response.data.data?.userId
            )
            
            if (existingReactionIndex !== -1) {
              // If same reaction, remove it
              if (this.posts[postIndex].reactions[existingReactionIndex].type === reactionType) {
                this.posts[postIndex].reactions.splice(existingReactionIndex, 1)
                this.posts[postIndex]._count.reactions--
              } else {
                // If different reaction, update it
                this.posts[postIndex].reactions[existingReactionIndex].type = reactionType
              }
            } else {
              // Add new reaction
              this.posts[postIndex].reactions.push(response.data.data)
              this.posts[postIndex]._count.reactions++
            }
          }
          
          return { success: true, message: response.data.message }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Failed to add reaction' }
      }
    },
    
    async addComment(postId: string, content: string, parentId?: string) {
      try {
        const response = await axios.post('/api/comments', { postId, content, parentId })
        
        if (response.data.success) {
          // Update post in the posts array
          const postIndex = this.posts.findIndex(post => post.id === postId)
          
          if (postIndex !== -1) {
            this.posts[postIndex]._count.comments++
          }
          
          return { success: true, message: response.data.message, data: response.data.data }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Failed to add comment' }
      }
    },
    
    async deleteComment(commentId: string, postId: string) {
      try {
        const response = await axios.delete(`/api/comments/${commentId}`)
        
        if (response.data.success) {
          // Update post in the posts array
          const postIndex = this.posts.findIndex(post => post.id === postId)
          
          if (postIndex !== -1) {
            this.posts[postIndex]._count.comments--
          }
          
          return { success: true, message: response.data.message }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Failed to delete comment' }
      }
    },
    
    async toggleFavorite(postId: string) {
      try {
        const response = await axios.post('/api/favorites', { postId })
        
        if (response.data.success) {
          return { success: true, message: response.data.message }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Failed to toggle favorite' }
      }
    },
    
    async toggleSavePost(postId: string) {
      try {
        const response = await axios.post('/api/save', { postId })
        
        if (response.data.success) {
          // If we're looking at saved posts, remove it from array
          if (response.data.message.includes('removed')) {
            this.savedPosts = this.savedPosts.filter(post => post.id !== postId)
          }
          
          return { success: true, message: response.data.message }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Failed to toggle save post' }
      }
    }
  }
}) 