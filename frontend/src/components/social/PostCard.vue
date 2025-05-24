<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { useFeedStore } from '../../stores/feed'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const feedStore = useFeedStore()

const showComments = ref(false)
const comment = ref('')
const isSubmittingComment = ref(false)
const isTogglingSave = ref(false)
const isTogglingFavorite = ref(false)
const isAddingReaction = ref(false)

// Get current user ID from localStorage for checking reactions
const getCurrentUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.id
}

onMounted(() => {
  // Animate card entrance
  gsap.fromTo(
    '.post-card',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
  )

  // Ensure comments are properly initialized
  if (!props.post.comments) {
    props.post.comments = []
  }
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const toggleComments = () => {
  showComments.value = !showComments.value
  
  if (showComments.value) {
    // Animate comments section
    setTimeout(() => {
      gsap.fromTo(
        '.comments-section',
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' }
      )
    }, 0)
  }
}

const addReaction = async (postId: string, reactionType: string) => {
  if (isAddingReaction.value) return
  
  isAddingReaction.value = true
  
  try {
    await feedStore.addReaction(postId, reactionType)
  } catch (error) {
    console.error('Error adding reaction:', error)
  } finally {
    isAddingReaction.value = false
  }
}

// Check if current user has a specific reaction
const hasReaction = (reactionType: string) => {
  const userId = getCurrentUserId()
  if (!userId || !props.post.reactions) return false
  
  return props.post.reactions.some((r: any) => r.userId === userId && r.type === reactionType)
}

const submitComment = async () => {
  if (!comment.value.trim()) return
  
  isSubmittingComment.value = true
  console.log('Attempting to submit comment:', { postId: props.post.id, content: comment.value })
  
  try {
    const result = await feedStore.addComment(props.post.id, comment.value)
    console.log('Comment submission result:', result)
    
    if (result.success) {
      comment.value = ''
      showComments.value = true
      
      // Animate new comment
      setTimeout(() => {
        const newComment = document.querySelector('.comment-item:first-child')
        if (newComment) {
          gsap.fromTo(
            newComment,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
          )
        }
      }, 0)
    } else {
      console.error('Failed to add comment:', result.message)
      alert('Failed to add comment: ' + result.message)
    }
  } catch (error) {
    console.error('Error adding comment:', error)
    alert('Error adding comment. Please try again.')
  } finally {
    isSubmittingComment.value = false
  }
}

const toggleSavePost = async () => {
  if (isTogglingSave.value) return
  
  isTogglingSave.value = true
  
  try {
    await feedStore.toggleSavePost(props.post.id)
  } catch (error) {
    console.error('Error toggling save post:', error)
  } finally {
    isTogglingSave.value = false
  }
}

const toggleFavorite = async () => {
  if (isTogglingFavorite.value) return
  
  isTogglingFavorite.value = true
  
  try {
    await feedStore.toggleFavorite(props.post.id)
  } catch (error) {
    console.error('Error toggling favorite:', error)
  } finally {
    isTogglingFavorite.value = false
  }
}

const navigateToProfile = (userId: string) => {
  router.push(`/user/${userId}`)
}
</script>

<template>
  <div class="post-card">
    <!-- Post header -->
    <div class="post-header">
      <div 
        v-if="post.author.profile?.profilePictureUrl" 
        class="avatar-img cursor-pointer"
        @click="navigateToProfile(post.author.id)"
      >
        <img 
          :src="post.author.profile.profilePictureUrl" 
          alt="Profile picture" 
        />
      </div>
      <div 
        v-else 
        class="avatar-gradient cursor-pointer"
        @click="navigateToProfile(post.author.id)"
      >
        {{ post.author.firstName.charAt(0) }}{{ post.author.lastName.charAt(0) }}
      </div>
      <div class="header-info">
        <div class="header-row">
          <h3 
            class="author-name cursor-pointer hover:text-indigo-600 transition-colors"
            @click="navigateToProfile(post.author.id)"
          >
            {{ post.author.firstName }} {{ post.author.lastName }}
          </h3>
          <span v-if="post.isVerified" class="verified-badge">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </span>
        </div>
        <div class="header-row">
          <span 
            class="author-username cursor-pointer hover:text-indigo-600 transition-colors"
            @click="navigateToProfile(post.author.id)"
          >
            @{{ post.author.username }}
          </span>
          <span class="post-date">{{ formatDate(post.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Post content -->
    <div class="post-content">
      <p class="content-text">{{ post.content }}</p>
      <!-- Post images (if any) -->
      <div v-if="post.SocialPostImage && post.SocialPostImage.length" class="post-images">
        <div class="image-grid" :class="{
          'one': post.SocialPostImage.length === 1,
          'two': post.SocialPostImage.length === 2 || post.SocialPostImage.length === 4,
          'three': post.SocialPostImage.length === 3 || post.SocialPostImage.length >= 5
        }">
          <div v-for="(image, index) in post.SocialPostImage.slice(0, 5)" :key="index" class="image-item">
            <img 
              :src="image.imageUrl" 
              :alt="`Image ${index + 1}`" 
            />
            <div 
              v-if="index === 4 && post.SocialPostImage.length > 5" 
              class="more-overlay"
            >
              +{{ post.SocialPostImage.length - 5 }}
            </div>
          </div>
        </div>
      </div>
      <!-- Tagged pets (if any) -->
      <div v-if="post.taggedPets && post.taggedPets.length" class="tagged-pets">
        <div class="pet-tag" v-for="pet in post.taggedPets" :key="pet.id">
          #{{ pet.name }}
        </div>
      </div>
    </div>

    <!-- Reaction counts -->
    <div v-if="post._count?.reactions > 0" class="reaction-counts">
      <div class="reaction-icons">
        <span class="reaction-icon like">👍</span>
        <span class="reaction-icon love">❤️</span>
        <span class="reaction-icon laugh">😁</span>
      </div>
      <span class="reaction-total">{{ post._count.reactions }} reactions</span>
    </div>

    <!-- Post actions -->
    <div class="post-actions">
      <div class="actions-left">
        <button 
          @click="addReaction(post.id, 'LIKE')" 
          class="reaction-btn"
          :class="{ 'active': hasReaction('LIKE') }"
          :disabled="isAddingReaction"
        >
          <span class="reaction-icon">👍</span>
          Like
        </button>
        <button 
          @click="addReaction(post.id, 'LOVE')" 
          class="reaction-btn"
          :class="{ 'active': hasReaction('LOVE') }"
          :disabled="isAddingReaction"
        >
          <span class="reaction-icon">❤️</span>
          Love
        </button>
        <button 
          @click="addReaction(post.id, 'LAUGH')" 
          class="reaction-btn"
          :class="{ 'active': hasReaction('LAUGH') }"
          :disabled="isAddingReaction"
        >
          <span class="reaction-icon">😁</span>
          Laugh
        </button>
        <button 
          @click="toggleComments" 
          class="reaction-btn"
        >
          <span class="reaction-icon">💬</span>
          Comment
        </button>
      </div>
      <div class="actions-right">
        <button 
          @click="toggleSavePost" 
          class="save-btn"
          :disabled="isTogglingSave"
        >
          <span class="save-icon">🔖</span>
          Save
        </button>
      </div>
    </div>

    <!-- Comments section -->
    <transition name="fade-slide">
      <div v-if="showComments" class="comments-section">
        <h4 class="comments-title">Comments</h4>
        <div class="comment-form">
          <div class="comment-input-wrap">
            <textarea
              v-model="comment"
              placeholder="Write a comment..."
              class="comment-input"
              rows="2"
            ></textarea>
            <button
              @click="submitComment"
              class="comment-submit-btn"
              :disabled="isSubmittingComment || !comment.trim()"
            >
              {{ isSubmittingComment ? 'Posting...' : 'Post' }}
            </button>
          </div>
        </div>
        <div v-if="post.comments && post.comments.length" class="comments-list">
          <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
            <div v-if="comment.author.profile?.profilePictureUrl" class="comment-avatar-img">
              <img 
                :src="comment.author.profile.profilePictureUrl" 
                alt="Profile picture" 
              />
            </div>
            <div v-else class="comment-avatar-gradient">
              {{ comment.author.firstName.charAt(0) }}{{ comment.author.lastName.charAt(0) }}
            </div>
            <div class="comment-body">
              <div class="comment-header">
                <span class="comment-author">{{ comment.author.firstName }} {{ comment.author.lastName }}</span>
                <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
            </div>
          </div>
        </div>
        <div v-else class="no-comments">
          No comments yet. Be the first to comment!
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.post-card {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 4px 16px 0 rgba(255, 94, 156, 0.08);
  margin-bottom: 1.5rem;
  overflow: hidden;
  padding: 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.post-header {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3e6f1;
}

.avatar-img img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ff7eb3;
}

.avatar-gradient {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.1rem;
  margin-right: 0.8rem;
}

.post-content {
  padding: 1rem 1.5rem;
  font-size: 1rem;
  line-height: 1.6;
  color: #3d2a3d;
}

.content-text {
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.post-images {
  margin-bottom: 1.1rem;
}

.image-grid {
  display: grid;
  gap: 0.5rem;
}

.image-grid.one {
  grid-template-columns: 1fr;
}

.image-grid.two {
  grid-template-columns: 1fr 1fr;
}

.image-grid.three {
  grid-template-columns: 1fr 1fr 1fr;
}

.image-item {
  position: relative;
  aspect-ratio: 1/1;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 2px 8px 0 rgba(255, 94, 156, 0.08);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1rem;
}

.more-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
}

.tagged-pets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.pet-tag {
  background: #f3e6f1;
  color: #b36b8a;
  font-size: 0.97rem;
  font-weight: 600;
  border-radius: 1rem;
  padding: 0.2rem 0.9rem;
}

.reaction-counts {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 2rem 0.2rem 2rem;
  border-bottom: 1px solid #f3e6f1;
}

.reaction-icons {
  display: flex;
  gap: 0.2rem;
}

.reaction-icon {
  font-size: 1rem;
  width: 1.5rem;
  height: 1.5rem;
}

.reaction-total {
  font-size: 1rem;
  color: #b36b8a;
  font-weight: 500;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem;
  border-top: 1px solid #f3e6f1;
}

.actions-left {
  display: flex;
  gap: 0.5rem;
}

.actions-right {
  display: flex;
  gap: 0.5rem;
}

.reaction-btn, .save-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border: none;
  background: #fff0f7;
  color: #d72660;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reaction-btn:hover, .save-btn:hover {
  background: #ffe0ef;
}

.reaction-btn.active {
  background: #ff5e9c;
  color: white;
}

.comments-section {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f3e6f1;
}

.comments-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #d72660;
  margin-bottom: 1.1rem;
}

.comment-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.comment-avatar, .comment-avatar-img, .comment-avatar-gradient {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #7f5fff 0%, #ff7eb3 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.comment-avatar-img img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.comment-input-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 100%;
}

.comment-input {
  width: 100%;
  padding: 0.7rem;
  border: 1.5px solid #ffe0ef;
  border-radius: 0.5rem;
  background: #fff0f7;
  font-size: 0.95rem;
  resize: none;
  outline: none;
  transition: all 0.2s;
}

.comment-input:focus {
  border-color: #ff5e9c;
  background: white;
}

.comment-submit-btn {
  align-self: flex-end;
  padding: 0.4rem 1rem;
  background: #ff5e9c;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.comment-submit-btn:hover:not(:disabled) {
  background: #d72660;
}

.comment-submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  display: flex;
  gap: 0.8rem;
  padding: 0.8rem;
  background: #fff0f7;
  border-radius: 0.5rem;
}

.comment-body {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.3rem;
}

.comment-author {
  font-weight: 600;
  color: #3d2a3d;
}

.comment-date {
  font-size: 0.8rem;
  color: #b36b8a;
}

.comment-content {
  color: #3d2a3d;
  font-size: 0.95rem;
  line-height: 1.4;
}

.no-comments {
  text-align: center;
  color: #b36b8a;
  padding: 1rem 0;
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
  .post-card {
    margin: 1rem;
    border-radius: 0.8rem;
  }

  .post-header, .post-content, .post-actions, .comments-section {
    padding: 0.8rem 1rem;
  }

  .reaction-btn, .save-btn {
    padding: 0 0.8rem;
    font-size: 0.85rem;
  }
}

.cursor-pointer {
  cursor: pointer;
}

.hover\:text-indigo-600:hover {
  color: #4f46e5;
}

.transition-colors {
  transition-property: color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style> 