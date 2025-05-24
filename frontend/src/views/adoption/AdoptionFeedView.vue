<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth';
import MainLayout from '../../components/layouts/MainLayout.vue';
import CreateAdoptionPostView from './CreateAdoptionPostView.vue'; // For the modal

interface AdoptionPost {
  id: string;
  title: string;
  description: string;
  location?: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    profile?: {
      profilePictureUrl?: string;
    };
  };
  petProfile?: {
    id: string;
    name: string;
    species?: string;
    breed?: string;
    age?: string | number;
    gender?: string;
    profilePicture?: string;
  };
  PetAdoptionPostImage: { id: string; imageUrl: string }[];
  _count?: {
    applications: number;
  };
}

const authStore = useAuthStore();
const adoptionPosts = ref<AdoptionPost[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const showCreatePostModal = ref(false);
const page = ref(1);
const limit = ref(10); // Or your preferred page size
const hasMore = ref(true);

const fetchAdoptionPosts = async (isLoadMore = false) => {
  if (isLoading.value || (!isLoadMore && !hasMore.value && adoptionPosts.value.length > 0)) return;

  isLoading.value = true;
  if (!isLoadMore) {
    page.value = 1;
    adoptionPosts.value = []; // Reset for fresh load or initial load
  }

  try {
    const response = await axios.get('/api/user/adoption-feed', {
      params: { page: page.value, limit: limit.value },
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (response.data.success) {
      adoptionPosts.value = isLoadMore ? [...adoptionPosts.value, ...response.data.data] : response.data.data;
      hasMore.value = response.data.hasMore;
      if (response.data.hasMore) {
        page.value++;
      }
    } else {
      error.value = response.data.message || 'Failed to fetch adoption posts.';
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'An unexpected error occurred.';
    console.error('Error fetching adoption posts:', err);
  } finally {
    isLoading.value = false;
  }
};

const openCreatePostModal = () => {
  showCreatePostModal.value = true;
};

const closeCreatePostModal = () => {
  showCreatePostModal.value = false;
};

const handlePostCreated = () => {
  closeCreatePostModal();
  fetchAdoptionPosts(); // Refresh the feed
};

onMounted(() => {
  fetchAdoptionPosts();
});
</script>

<template>
  <MainLayout>
    <div class="adoption-feed-page">
      <div class="feed-header">
        <h1 class="feed-title">Pets for Adoption</h1>
        <button @click="openCreatePostModal" class="create-post-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Post Pet for Adoption
        </button>
      </div>

      <div v-if="isLoading && adoptionPosts.length === 0" class="loading-indicator">Loading...</div>
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <div v-if="adoptionPosts.length > 0" class="posts-grid">
        <div v-for="post in adoptionPosts" :key="post.id" class="post-card">
          <div class="post-image-container">
            <img 
              :src="post.PetAdoptionPostImage?.[0]?.imageUrl || post.petProfile?.profilePicture || '/placeholder-pet.jpg'" 
              alt="Pet image" 
              class="post-image"
            />
          </div>
          <div class="post-content">
            <h2 class="post-title">{{ post.title }}</h2>
            <p class="pet-name">{{ post.petProfile?.name || 'Pet' }} <span v-if="post.petProfile?.breed">({{ post.petProfile.breed }})</span></p>
            <p class="post-description">{{ post.description.substring(0, 100) }}{{ post.description.length > 100 ? '...' : '' }}</p>
            <div class="post-author">
              <img :src="post.author.profile?.profilePictureUrl || '/placeholder-avatar.png'" alt="Author" class="author-avatar" />
              <span>{{ post.author.firstName || post.author.username }}</span>
            </div>
            <router-link :to="`/adoption-post/${post.id}`" class="view-post-link">View Details</router-link>
          </div>
        </div>
      </div>
      <div v-else-if="!isLoading && !error" class="empty-feed">
        No pets currently up for adoption. Be the first to post!
      </div>

      <div v-if="hasMore && !isLoading" class="load-more-container">
        <button @click="fetchAdoptionPosts(true)" class="load-more-btn">Load More</button>
      </div>
      <div v-if="isLoading && adoptionPosts.length > 0" class="loading-indicator">Loading more posts...</div>

    </div>

    <!-- Create Post Modal -->
    <div v-if="showCreatePostModal" class="modal-overlay" @click.self="closeCreatePostModal">
      <div class="modal-content">
        <button @click="closeCreatePostModal" class="modal-close-btn">&times;</button>
        <CreateAdoptionPostView @postCreated="handlePostCreated" />
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.adoption-feed-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.feed-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #333;
}

.create-post-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.create-post-btn:hover {
  background: linear-gradient(90deg, #ff7eb3 0%, #ff5e9c 100%);
}
.create-post-btn .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.loading-indicator, .empty-feed {
  text-align: center;
  padding: 2rem;
  color: #777;
  font-size: 1.1rem;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.post-card {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}
.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.post-image-container {
  width: 100%;
  height: 200px; /* Fixed height for images */
  overflow: hidden;
}
.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.post-card:hover .post-image {
  transform: scale(1.05);
}

.post-content {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.pet-name {
  font-size: 1rem;
  color: #ff5e9c;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.post-description {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #777;
  margin-bottom: 1rem;
}
.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.view-post-link {
  display: inline-block;
  margin-top: auto; /* Pushes to the bottom */
  padding: 0.5rem 1rem;
  background-color: #fff0f7;
  color: #ff5e9c;
  border: 1px solid #ff5e9c;
  border-radius: 0.375rem;
  text-align: center;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
}
.view-post-link:hover {
  background-color: #ff5e9c;
  color: white;
}

.load-more-container {
  text-align: center;
  margin-top: 2rem;
}
.load-more-btn {
  padding: 0.75rem 2rem;
  background-color: #e0eafc;
  color: #333;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.load-more-btn:hover {
  background-color: #cad5e8;
}

/* Modal styles (similar to Navigation.vue but scoped here) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 0; /* Let CreateAdoptionPostView handle its padding */
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 700px; 
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 10; /* Ensure it's above the form content */
}
.modal-close-btn:hover {
  color: #333;
}
</style> 