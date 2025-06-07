<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from "../../stores/auth";
import MainLayout from "../../components/layouts/MainLayout.vue";
import CreateAdoptionPostView from "./CreateAdoptionPostView.vue"; // For the modal

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

const API_URL = import.meta.env.VITE_API_URL;

const getImageUrl = (imageUrl: string | undefined) => {
  if (!imageUrl) return "";
  return `${API_URL}/${imageUrl}`;
};

const fetchAdoptionPosts = async (isLoadMore = false) => {
  if (
    isLoading.value ||
    (!isLoadMore && !hasMore.value && adoptionPosts.value.length > 0)
  )
    return;

  isLoading.value = true;
  if (!isLoadMore) {
    page.value = 1;
    adoptionPosts.value = []; // Reset for fresh load or initial load
  }

  try {
    const response = await axios.get("/api/user/adoption-feed", {
      params: { page: page.value, limit: limit.value },
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (response.data.success) {
      adoptionPosts.value = isLoadMore
        ? [...adoptionPosts.value, ...response.data.data]
        : response.data.data;
      hasMore.value = response.data.hasMore;
      if (response.data.hasMore) {
        page.value++;
      }
    } else {
      error.value = response.data.message || "Failed to fetch adoption posts.";
    }
  } catch (err: any) {
    error.value =
      err.response?.data?.message ||
      err.message ||
      "An unexpected error occurred.";
    console.error("Error fetching adoption posts:", err);
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="icon"
          >
            <path
              d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
            />
          </svg>
          Post Pet for Adoption
        </button>
      </div>

      <div
        v-if="isLoading && adoptionPosts.length === 0"
        class="loading-indicator"
      >
        Loading...
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>

      <div v-if="adoptionPosts.length > 0" class="posts-grid">
        <div v-for="post in adoptionPosts" :key="post.id" class="post-card">
          <div class="post-image-container">
            <img
              v-if="
                post.PetAdoptionPostImage?.[0]?.imageUrl ||
                post.petProfile?.profilePicture
              "
              :src="
                getImageUrl(
                  post.PetAdoptionPostImage?.[0]?.imageUrl ||
                    post.petProfile?.profilePicture
                )
              "
              alt="Pet image"
              class="post-image"
            />
            <div v-else class="no-image">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                class="placeholder-icon"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <div class="post-content">
            <h2 class="post-title">{{ post.title }}</h2>
            <p class="pet-name">
              {{ post.petProfile?.name || "Pet" }}
              <span v-if="post.petProfile?.breed"
                >({{ post.petProfile.breed }})</span
              >
            </p>
            <p class="post-description">
              {{ post.description.substring(0, 100)
              }}{{ post.description.length > 100 ? "..." : "" }}
            </p>
            <div class="post-author">
              <div
                v-if="post.author.profile?.profilePictureUrl"
                class="author-avatar"
              >
                <img
                  :src="getImageUrl(post.author.profile.profilePictureUrl)"
                  alt="Author"
                />
              </div>
              <div v-else class="author-avatar default-avatar">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                  ></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <span>{{ post.author.firstName || post.author.username }}</span>
            </div>
            <router-link
              :to="`/adoption-post/${post.id}`"
              class="view-post-link"
              >View Details</router-link
            >
          </div>
        </div>
      </div>
      <div v-else-if="!isLoading && !error" class="empty-feed">
        No pets currently up for adoption. Be the first to post!
      </div>

      <div v-if="hasMore && !isLoading" class="load-more-container">
        <button @click="fetchAdoptionPosts(true)" class="load-more-btn">
          Load More
        </button>
      </div>
      <div
        v-if="isLoading && adoptionPosts.length > 0"
        class="loading-indicator"
      >
        Loading more posts...
      </div>

      <div class="copyright">
        © {{ new Date().getFullYear() }} PawPal. All rights reserved.
      </div>
    </div>

    <!-- Create Post Modal -->
    <div
      v-if="showCreatePostModal"
      class="modal-overlay"
      @click.self="closeCreatePostModal"
    >
      <div class="modal-content">
        <button @click="closeCreatePostModal" class="modal-close-btn">
          &times;
        </button>
        <div class="modal-layout">
          <div class="modal-side">
            <h2 class="form-title">Create Adoption Post</h2>
            <p class="form-subtitle">
              Help a pet find their forever home by creating an adoption
              listing.
            </p>
            <!-- Preview section can go here -->
            <div class="preview-section">
              <div v-if="selectedPetDetails" class="selected-pet-preview">
                <img
                  v-if="selectedPetDetails.profilePicture"
                  :src="getImageUrl(selectedPetDetails.profilePicture)"
                  :alt="selectedPetDetails.name"
                  class="pet-preview-image"
                />
                <div v-else class="no-preview">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    class="placeholder-icon"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-main">
            <CreateAdoptionPostView @postCreated="handlePostCreated" />
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.adoption-feed-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 80px); /* Adjust for footer height */
  position: relative;
  padding-bottom: 60px; /* Space for footer */
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

.loading-indicator,
.empty-feed {
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
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  color: #9ca3af;
  padding: 4px;
}

.default-avatar svg {
  width: 100%;
  height: 100%;
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

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  width: 95%;
  max-width: 1000px; /* Increased for 2-column layout */
  position: relative;
  animation: modalFadeIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Add these styles for the 2-column grid layout */
:deep(.form-grid) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  align-items: start;
}

:deep(.form-group) {
  margin-bottom: 1rem;
}

:deep(.form-label) {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

:deep(.form-input),
:deep(select),
:deep(textarea) {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

:deep(.form-input:focus),
:deep(select:focus),
:deep(textarea:focus) {
  border-color: #ff5e9c;
  box-shadow: 0 0 0 2px rgba(255, 94, 156, 0.1);
  outline: none;
}

:deep(.form-title) {
  grid-column: span 2;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
  text-align: center;
}

:deep(.form-subtitle) {
  grid-column: span 2;
  text-align: center;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

:deep(.form-full-width) {
  grid-column: span 2;
}

:deep(.form-actions) {
  grid-column: span 2;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

:deep(.preview-section) {
  grid-column: span 2;
  margin-top: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px dashed #e5e7eb;
}

:deep(.image-upload-grid) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-width: 400px;
  }

  :deep(.form-grid) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  :deep(.form-title),
  :deep(.form-subtitle),
  :deep(.form-full-width),
  :deep(.form-actions),
  :deep(.preview-section) {
    grid-column: span 1;
  }

  :deep(.image-upload-grid) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.modal-close-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #666;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.modal-close-btn:hover {
  background: #e5e7eb;
  color: #333;
  transform: rotate(90deg);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.copyright {
  text-align: center;
  padding: 1rem;
  font-size: 0.875rem;
  color: #666;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #eee;
}

.no-image,
.no-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #9ca3af;
}

.placeholder-icon {
  width: 40%;
  height: 40%;
}
</style>
