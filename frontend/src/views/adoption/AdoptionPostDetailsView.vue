<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useAuthStore } from "../../stores/auth";
import MainLayout from "../../components/layouts/MainLayout.vue";

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
    size?: string;
    color?: string;
    description?: string;
    profilePicture?: string;
  };
  PetAdoptionPostImage: { id: string; imageUrl: string }[];
  _count?: {
    applications: number;
  };
}

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const API_URL = import.meta.env.VITE_API_URL;

const post = ref<AdoptionPost | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const getImageUrl = (imageUrl: string | undefined) => {
  if (!imageUrl) return "";
  return `${API_URL}/${imageUrl}`;
};

const fetchPostDetails = async () => {
  try {
    const response = await axios.get(
      `/api/user/adoption-posts/${route.params.id}`,
      {
        headers: { Authorization: `Bearer ${authStore.token}` },
      }
    );
    if (response.data.success) {
      post.value = response.data.data;
    } else {
      error.value =
        response.data.message || "Failed to fetch adoption post details.";
    }
  } catch (err: any) {
    error.value =
      err.response?.data?.message ||
      err.message ||
      "An unexpected error occurred.";
    console.error("Error fetching adoption post details:", err);
  } finally {
    isLoading.value = false;
  }
};

const applyForAdoption = async () => {
  try {
    const response = await axios.post(
      "/api/user/adoption-applications",
      { postId: route.params.id },
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    );
    if (response.data.success) {
      router.push("/messages"); // Redirect to messages where they can chat with the owner
    } else {
      error.value = response.data.message || "Failed to apply for adoption.";
    }
  } catch (err: any) {
    error.value =
      err.response?.data?.message ||
      err.message ||
      "Failed to apply for adoption.";
  }
};

onMounted(() => {
  fetchPostDetails();
});
</script>

<template>
  <MainLayout>
    <div class="adoption-post-details">
      <div v-if="isLoading" class="loading-indicator">Loading...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="post" class="post-content">
        <div class="post-header">
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-meta">
            <div class="author-info">
              <div class="author-avatar">
                <img
                  v-if="post.author.profile?.profilePictureUrl"
                  :src="getImageUrl(post.author.profile.profilePictureUrl)"
                  :alt="post.author.firstName || post.author.username"
                />
                <div v-else class="default-avatar">
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
              </div>
              <span class="author-name">{{
                post.author.firstName || post.author.username
              }}</span>
            </div>
            <div class="post-date">
              Posted on {{ new Date(post.createdAt).toLocaleDateString() }}
            </div>
          </div>
        </div>

        <div class="pet-images">
          <div
            v-if="post.PetAdoptionPostImage.length > 0"
            class="image-gallery"
          >
            <img
              v-for="image in post.PetAdoptionPostImage"
              :key="image.id"
              :src="getImageUrl(image.imageUrl)"
              :alt="post.petProfile?.name || 'Pet'"
              class="gallery-image"
            />
          </div>
          <div v-else-if="post.petProfile?.profilePicture" class="single-image">
            <img
              :src="getImageUrl(post.petProfile.profilePicture)"
              :alt="post.petProfile.name"
              class="profile-image"
            />
          </div>
          <div v-else class="no-image">
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <div class="pet-details">
          <h2 class="pet-name">{{ post.petProfile?.name || "Unnamed Pet" }}</h2>
          <div class="details-grid">
            <div v-if="post.petProfile?.species" class="detail-item">
              <span class="label">Species:</span>
              <span class="value">{{ post.petProfile.species }}</span>
            </div>
            <div v-if="post.petProfile?.breed" class="detail-item">
              <span class="label">Breed:</span>
              <span class="value">{{ post.petProfile.breed }}</span>
            </div>
            <div v-if="post.petProfile?.age" class="detail-item">
              <span class="label">Age:</span>
              <span class="value">{{ post.petProfile.age }}</span>
            </div>
            <div v-if="post.petProfile?.gender" class="detail-item">
              <span class="label">Gender:</span>
              <span class="value">{{ post.petProfile.gender }}</span>
            </div>
            <div v-if="post.petProfile?.size" class="detail-item">
              <span class="label">Size:</span>
              <span class="value">{{ post.petProfile.size }}</span>
            </div>
            <div v-if="post.petProfile?.color" class="detail-item">
              <span class="label">Color:</span>
              <span class="value">{{ post.petProfile.color }}</span>
            </div>
          </div>
        </div>

        <div class="post-description">
          <h3>About {{ post.petProfile?.name || "this pet" }}</h3>
          <p>{{ post.description }}</p>
          <p v-if="post.petProfile?.description" class="pet-bio">
            {{ post.petProfile.description }}
          </p>
        </div>

        <div v-if="post.location" class="location-info">
          <h3>Location</h3>
          <p>{{ post.location }}</p>
        </div>

        <div class="adoption-cta">
          <button @click="applyForAdoption" class="apply-button">
            Apply for Adoption
          </button>
          <p class="applications-count" v-if="post._count?.applications">
            {{ post._count.applications }} application(s) received
          </p>
        </div>
      </div>
      <div v-else class="not-found">
        <h2>Post Not Found</h2>
        <p>
          The adoption post you're looking for doesn't exist or has been
          removed.
        </p>
        <router-link to="/adoption-feed" class="back-link"
          >Back to Adoption Feed</router-link
        >
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.adoption-post-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.loading-indicator {
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

.post-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.post-header {
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
}

.post-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #f3f4f6;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  padding: 8px;
}

.author-name {
  font-weight: 500;
}

.pet-images {
  width: 100%;
  background: #f8f9fa;
  padding: 1rem;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.gallery-image,
.profile-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.no-image {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  border-radius: 0.5rem;
  color: #adb5bd;
}

.no-image svg {
  width: 64px;
  height: 64px;
}

.pet-details {
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
}

.pet-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ff5e9c;
  margin-bottom: 1.5rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.875rem;
  color: #666;
}

.value {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}

.post-description {
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
}

.post-description h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.post-description p {
  color: #444;
  line-height: 1.6;
}

.pet-bio {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.location-info {
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
}

.location-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.adoption-cta {
  padding: 2rem;
  text-align: center;
}

.apply-button {
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.apply-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 94, 156, 0.2);
}

.applications-count {
  margin-top: 1rem;
  color: #666;
  font-size: 0.875rem;
}

.not-found {
  text-align: center;
  padding: 4rem 2rem;
}

.not-found h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.not-found p {
  color: #666;
  margin-bottom: 2rem;
}

.back-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  color: #ff5e9c;
  border: 1px solid #ff5e9c;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.back-link:hover {
  background-color: #ff5e9c;
  color: white;
}
</style>
