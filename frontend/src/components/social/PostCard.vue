<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { useFeedStore } from '../../stores/feed'

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
  
  try {
    const result = await feedStore.addComment(props.post.id, comment.value)
    
    if (result.success) {
      comment.value = ''
      showComments.value = true
      
      // Animate new comment
      setTimeout(() => {
        const newComment = document.querySelector('.comment:last-child')
        if (newComment) {
          gsap.fromTo(
            newComment,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
          )
        }
      }, 0)
    }
  } catch (error) {
    console.error('Error adding comment:', error)
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
</script>

<template>
  <div class="post-card">
    <!-- Post header -->
    <div class="post-header">
      <div v-if="post.author.profile?.profilePictureUrl" class="avatar-img">
        <img 
          :src="post.author.profile.profilePictureUrl" 
          alt="Profile picture" 
        />
      </div>
      <div v-else class="avatar-gradient">
        {{ post.author.firstName.charAt(0) }}{{ post.author.lastName.charAt(0) }}
      </div>
      <div class="header-info">
        <div class="header-row">
          <h3 class="author-name">
            {{ post.author.firstName }} {{ post.author.lastName }}
          </h3>
          <span v-if="post.isVerified" class="verified-badge">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </span>
        </div>
        <div class="header-row">
          <span class="author-username">@{{ post.author.username }}</span>
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
        <span class="reaction-icon smile">😁</span>
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
          <span class="reaction-icon like">👍</span>
          Like
        </button>
        <button 
          @click="addReaction(post.id, 'LOVE')" 
          class="reaction-btn"
          :class="{ 'active': hasReaction('LOVE') }"
          :disabled="isAddingReaction"
        >
          <span class="reaction-icon love">❤️</span>
          Love
        </button>
        <button 
          @click="addReaction(post.id, 'SMILE')" 
          class="reaction-btn"
          :class="{ 'active': hasReaction('SMILE') }"
          :disabled="isAddingReaction"
        >
          <span class="reaction-icon smile">😁</span>
          Smile
        </button>
        <button 
          @click="toggleComments" 
          class="reaction-btn"
        >
          <span class="reaction-icon comment">💬</span>
          Comment
        </button>
      </div>
      <div class="actions-right">
        <button
          @click="toggleFavorite"
          class="favorite-btn"
          :class="{ 'animate-pulse': isTogglingFavorite }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button
          @click="toggleSavePost"
          class="save-btn"
          :class="{ 'animate-pulse': isTogglingSave }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Comments section -->
    <transition name="fade-slide">
      <div v-if="showComments" class="comments-section">
        <h4 class="comments-title">Comments</h4>
        <div class="comment-form">
          <div class="comment-avatar"></div>
          <div class="comment-input-wrap">
            <textarea
              v-model="comment"
              placeholder="Write a comment..."
              class="comment-input"
              rows="2"
            ></textarea>
            <button
              @click="submitComment"
              class="comment-send"
              :disabled="isSubmittingComment || !comment.trim()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
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
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(255, 94, 156, 0.10), 0 1.5px 8px 0 rgba(31, 38, 135, 0.06);
  margin-bottom: 2.5rem;
  overflow: hidden;
  padding: 0;
  transition: box-shadow 0.2s;
}
.post-card:hover {
  box-shadow: 0 12px 40px 0 rgba(255, 94, 156, 0.13), 0 2px 12px 0 rgba(31, 38, 135, 0.10);
}
.post-header {
  display: flex;
  align-items: center;
  padding: 1.5rem 2rem 1rem 2rem;
  border-bottom: 1px solid #f3e6f1;
  background: linear-gradient(90deg, #fff 80%, #ffe0ef 100%);
}
.avatar-img img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2.5px solid #ff7eb3;
  box-shadow: 0 2px 8px 0 rgba(255, 94, 156, 0.10);
}
.avatar-gradient {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7f5fff 0%, #ff7eb3 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.3rem;
  margin-right: 1rem;
  box-shadow: 0 2px 8px 0 rgba(127, 95, 255, 0.10);
}
.header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.header-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.author-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d1e2f;
  letter-spacing: 0.01em;
}
.verified-badge {
  color: #ff5e9c;
  margin-left: 0.2rem;
}
.author-username {
  font-size: 0.97rem;
  color: #b36b8a;
  font-weight: 500;
}
.post-date {
  font-size: 0.97rem;
  color: #b36b8a;
  margin-left: 1.2rem;
}
.post-content {
  padding: 1.2rem 2rem 0.5rem 2rem;
}
.content-text {
  font-size: 1.13rem;
  color: #3d2a3d;
  margin-bottom: 1.1rem;
  font-weight: 500;
  line-height: 1.6;
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
  font-size: 1.1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
}
.reaction-icon.like {
  background: #e0e7ff;
  color: #7f5fff;
}
.reaction-icon.love {
  background: #ffe0ef;
  color: #ff5e9c;
}
.reaction-icon.smile {
  background: #fffbe0;
  color: #ffd600;
}
.reaction-icon.comment {
  background: #f3e6f1;
  color: #b36b8a;
}
.reaction-total {
  font-size: 1rem;
  color: #b36b8a;
  font-weight: 500;
}
.post-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 2rem 0.7rem 2rem;
  background: #fff;
}
.actions-left {
  display: flex;
  gap: 0.5rem;
}
.reaction-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #fff0f7;
  color: #ff5e9c;
  border: none;
  border-radius: 0.7rem;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.5rem 1.1rem;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px 0 rgba(255, 94, 156, 0.10);
  cursor: pointer;
}
.reaction-btn.active, .reaction-btn:hover, .reaction-btn:focus {
  background: #ffe0ef;
  color: #d72660;
}
.favorite-btn, .save-btn {
  background: #f3e6f1;
  color: #b36b8a;
  border: none;
  border-radius: 0.7rem;
  padding: 0.5rem 0.9rem;
  margin-left: 0.3rem;
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.favorite-btn:hover, .save-btn:hover {
  background: #ffe0ef;
  color: #ff5e9c;
}
.comments-section {
  background: #fff0f7;
  border-top: 1.5px solid #ffe0ef;
  padding: 1.5rem 2rem 1.5rem 2rem;
  border-radius: 0 0 1.5rem 1.5rem;
  margin-top: -0.5rem;
}
.comments-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #d72660;
  margin-bottom: 1.1rem;
}
.comment-form {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  margin-bottom: 1.2rem;
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
  position: relative;
}
.comment-input {
  width: 100%;
  border-radius: 0.7rem;
  border: 1.5px solid #ffe0ef;
  padding: 0.7rem 2.5rem 0.7rem 1rem;
  font-size: 1rem;
  color: #3d2a3d;
  background: #fff;
  resize: none;
  font-weight: 500;
  box-shadow: 0 2px 8px 0 rgba(255, 94, 156, 0.06);
}
.comment-send {
  position: absolute;
  right: 0.7rem;
  bottom: 0.7rem;
  background: none;
  border: none;
  color: #ff5e9c;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
}
.comment-send:disabled {
  color: #ccc;
  cursor: not-allowed;
}
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
}
.comment-body {
  background: #fff;
  border-radius: 1rem;
  padding: 0.7rem 1.1rem;
  box-shadow: 0 2px 8px 0 rgba(255, 94, 156, 0.06);
  flex: 1;
}
.comment-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.2rem;
}
.comment-author {
  font-weight: 700;
  color: #d72660;
  font-size: 1rem;
}
.comment-date {
  font-size: 0.95rem;
  color: #b36b8a;
}
.comment-content {
  color: #3d2a3d;
  font-size: 1.05rem;
  font-weight: 500;
}
.no-comments {
  text-align: center;
  color: #b36b8a;
  font-size: 1rem;
  margin-top: 1.2rem;
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
  .post-header, .post-content, .reaction-counts, .post-actions, .comments-section {
    padding-left: 0.7rem;
    padding-right: 0.7rem;
  }
  .post-card {
    border-radius: 1rem;
  }
}
</style> 