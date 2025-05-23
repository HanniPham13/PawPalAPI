import { defineStore } from 'pinia'
import axios from 'axios'

interface Profile {
  profilePictureUrl: string | null;
}

interface Author {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  verificationLevel: string;
  profile: Profile;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
  parentId?: string;
}

interface Reaction {
  id: string;
  type: string;
  userId: string;
  postId: string;
  createdAt: string;
}

interface PostCounts {
  reactions: number;
  comments: number;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
  comments: Comment[];
  reactions: Reaction[];
  _count: PostCounts;
  isFollowing?: boolean;
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
    async getFeedPosts(page = 1) {
      try {
        const response = await axios.get(`/api/feed?page=${page}`)
        
        if (response.data.success) {
          // If it's the first page, replace posts. Otherwise, append.
          if (page === 1) {
            this.posts = response.data.data
          } else {
            this.posts = [...this.posts, ...response.data.data]
          }
          this.hasMore = response.data.hasMore
        }
      } catch (error) {
        console.error('Error fetching feed posts:', error)
        throw error
      }
    },
    
    async fetchFeedPosts(refresh = false) {
      if (refresh) {
        this.page = 1
        this.posts = []
      }
      
      if (!this.hasMore && !refresh) return
      
      this.isLoading = true
      this.error = null
      
      try {
        await this.getFeedPosts(this.page)
        if (this.hasMore) {
          this.page++
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch posts'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async createPost(postData: CreatePostData) {
      try {
        let requestData: any;
        let headers: any = {};

        if (postData.images && postData.images.length > 0) {
          const formData = new FormData();
          formData.append('content', postData.content);
          postData.images.forEach((image) => {
            formData.append('postImage', image);
          });
          if (postData.taggedPetIds && postData.taggedPetIds.length > 0) {
            postData.taggedPetIds.forEach(petId => {
              formData.append('taggedPetIds[]', petId);
            });
          }
          requestData = formData;
        } else {
          requestData = { content: postData.content };
          if (postData.taggedPetIds && postData.taggedPetIds.length > 0) {
            requestData.taggedPetIds = postData.taggedPetIds;
          }
          headers['Content-Type'] = 'application/json';
        }
        
        const response = await axios.post('/api/user/posts', requestData, { headers });
        
        if (response.data.success) {
          // Initialize arrays if they don't exist
          if (!response.data.data.comments) {
            response.data.data.comments = [];
          }
          if (!response.data.data.reactions) {
            response.data.data.reactions = [];
          }
          if (!response.data.data._count) {
            response.data.data._count = { comments: 0, reactions: 0 };
          }

          // Add the new post to the beginning of the posts array
          this.posts.unshift(response.data.data);
          
          return { success: true, message: 'Post created successfully', data: response.data.data };
        } else {
          return { success: false, message: response.data.message || 'Failed to create post from server' };
        }
      } catch (error: any) {
        console.error('Error creating post:', error.response?.data || error.message || error);
        throw new Error(error.response?.data?.message || 'Failed to create post due to an error');
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
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
            // Find if user already reacted
            const existingReactionIndex = this.posts[postIndex].reactions.findIndex(
              reaction => reaction.userId === currentUser.id
            )
            
            if (existingReactionIndex !== -1) {
              // If same reaction, remove it
              if (this.posts[postIndex].reactions[existingReactionIndex].type === reactionType) {
                this.posts[postIndex].reactions.splice(existingReactionIndex, 1)
                if (this.posts[postIndex]._count) {
                  this.posts[postIndex]._count.reactions = Math.max(0, (this.posts[postIndex]._count.reactions || 0) - 1)
                }
              } else {
                // If different reaction, update it
                this.posts[postIndex].reactions[existingReactionIndex] = {
                  ...this.posts[postIndex].reactions[existingReactionIndex],
                  type: reactionType
                }
              }
            } else {
              // Add new reaction
              this.posts[postIndex].reactions.push({
                id: response.data.data.id,
                type: reactionType,
                userId: currentUser.id,
                postId: postId,
                createdAt: new Date().toISOString()
              })
              if (this.posts[postIndex]._count) {
                this.posts[postIndex]._count.reactions = (this.posts[postIndex]._count.reactions || 0) + 1
              }
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
    
    async addComment(postId: string, content: string) {
      try {
        const response = await axios.post('/api/comments', { postId, content })
        
        if (response.data.success) {
          // Find the post and add the new comment
          const postIndex = this.posts.findIndex(post => post.id === postId)
          if (postIndex !== -1) {
            if (!this.posts[postIndex].comments) {
              this.posts[postIndex].comments = []
            }
            this.posts[postIndex].comments.unshift(response.data.data)
            
            // Update comment count
            if (!this.posts[postIndex]._count) {
              this.posts[postIndex]._count = { reactions: 0, comments: 0 }
            }
            this.posts[postIndex]._count.comments++
          }
          return { success: true }
        }
        return { success: false }
      } catch (error) {
        console.error('Error adding comment:', error)
        return { success: false }
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