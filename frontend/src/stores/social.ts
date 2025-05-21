import { defineStore } from 'pinia'
import axios from 'axios'

interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  verificationLevel: string
  profile: {
    profilePictureUrl: string | null
  }
}

interface SocialState {
  followers: User[]
  following: User[]
  isLoading: boolean
  error: string | null
  hasMoreFollowers: boolean
  hasMoreFollowing: boolean
  followersPage: number
  followingPage: number
}

export const useSocialStore = defineStore('social', {
  state: (): SocialState => ({
    followers: [],
    following: [],
    isLoading: false,
    error: null,
    hasMoreFollowers: true,
    hasMoreFollowing: true,
    followersPage: 1,
    followingPage: 1
  }),
  
  actions: {
    async fetchFollowers(refresh = false) {
      if (refresh) {
        this.followersPage = 1
        this.followers = []
      }
      
      if (!this.hasMoreFollowers && !refresh) return
      
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`/api/followers?page=${this.followersPage}&limit=10`)
        
        if (response.data.success) {
          if (refresh) {
            this.followers = response.data.data
          } else {
            this.followers = [...this.followers, ...response.data.data]
          }
          
          this.hasMoreFollowers = response.data.hasMore
          this.followersPage++
        } else {
          this.error = response.data.message
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch followers'
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchFollowing(refresh = false) {
      if (refresh) {
        this.followingPage = 1
        this.following = []
      }
      
      if (!this.hasMoreFollowing && !refresh) return
      
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`/api/following?page=${this.followingPage}&limit=10`)
        
        if (response.data.success) {
          if (refresh) {
            this.following = response.data.data
          } else {
            this.following = [...this.following, ...response.data.data]
          }
          
          this.hasMoreFollowing = response.data.hasMore
          this.followingPage++
        } else {
          this.error = response.data.message
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch following'
      } finally {
        this.isLoading = false
      }
    },
    
    async followUser(followingId: string) {
      this.error = null
      
      try {
        const response = await axios.post('/api/follow', { followingId })
        
        if (response.data.success) {
          // Add user to following list if not already there
          if (!this.following.some(user => user.id === followingId)) {
            this.following.unshift(response.data.data.following)
          }
          
          return { success: true, message: response.data.message }
        } else {
          this.error = response.data.message
          return { success: false, message: response.data.message }
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to follow user'
        return { success: false, message: this.error }
      }
    },
    
    async unfollowUser(followingId: string) {
      this.error = null
      
      try {
        const response = await axios.post('/api/unfollow', { followingId })
        
        if (response.data.success) {
          // Remove user from following list
          this.following = this.following.filter(user => user.id !== followingId)
          
          return { success: true, message: response.data.message }
        } else {
          this.error = response.data.message
          return { success: false, message: response.data.message }
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to unfollow user'
        return { success: false, message: this.error }
      }
    },
    
    async removeFollower(followerId: string) {
      this.error = null
      
      try {
        const response = await axios.post('/api/remove-follower', { followerId })
        
        if (response.data.success) {
          // Remove user from followers list
          this.followers = this.followers.filter(user => user.id !== followerId)
          
          return { success: true, message: response.data.message }
        } else {
          this.error = response.data.message
          return { success: false, message: response.data.message }
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to remove follower'
        return { success: false, message: this.error }
      }
    }
  }
}) 