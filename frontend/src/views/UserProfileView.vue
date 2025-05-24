<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import MainLayout from '../components/layouts/MainLayout.vue'

const route = useRoute()
const userId = route.params.userId as string
const user = ref<any>(null)
const isLoading = ref(true)
const error = ref('')

const fetchUserProfile = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await axios.get(`/api/user/profile/${userId}`)
    if (response.data.success) {
      user.value = response.data.data
    } else {
      error.value = response.data.message || 'Failed to load profile'
    }
  } catch (err: any) {
    console.error('Error fetching user profile:', err)
    error.value = err.response?.data?.message || 'An error occurred while loading the profile'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<template>
  <MainLayout>
    <div class="profile-bg">
      <div class="profile-container">
        <div v-if="isLoading" class="profile-loader">
          <div class="loader"></div>
          <p>Loading profile...</p>
        </div>
        <div v-else-if="error" class="profile-error">
          <p>{{ error }}</p>
          <button @click="fetchUserProfile" class="retry-btn">Retry</button>
        </div>
        <div v-else-if="user" class="profile-card">
          <!-- Cover photo -->
          <div class="cover-photo-wrapper">
            <div
              v-if="user.coverPicture?.coverPictureUrl"
              class="cover-photo"
              :style="{ backgroundImage: `url(${user.coverPicture.coverPictureUrl})` }"
            ></div>
            <div v-else class="cover-photo cover-gradient"></div>
          </div>
          <!-- Profile picture -->
          <div class="profile-pic-wrapper">
            <div v-if="user.profile?.profilePictureUrl" class="profile-pic-img">
              <img :src="user.profile.profilePictureUrl" :alt="`${user.firstName}'s profile picture`" />
            </div>
            <div v-else class="profile-pic-gradient">
              {{ user.firstName?.charAt(0) }}{{ user.lastName?.charAt(0) }}
            </div>
          </div>
          <!-- Main info -->
          <div class="profile-main-info">
            <div class="profile-main-row">
              <div>
                <h1 class="profile-name">
                  {{ user.firstName }} {{ user.lastName }}
                  <span v-if="user.verificationLevel !== 'NONE'" class="verified-badge" :title="user.verificationLevel">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </h1>
                <div class="profile-username">@{{ user.username }}</div>
              </div>
              <button class="follow-btn">Follow</button>
            </div>
            <div v-if="user.bio" class="profile-bio">{{ user.bio }}</div>
            <div class="profile-stats-row">
              <div class="stat">
                <span class="stat-value">{{ user._count?.followers || 0 }}</span>
                <span class="stat-label">Followers</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ user._count?.following || 0 }}</span>
                <span class="stat-label">Following</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ user._count?.petProfiles || 0 }}</span>
                <span class="stat-label">Pets</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.profile-bg {
  min-height: 100vh;
  background: #f3f4f6;
}
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 0 4rem 0;
}
.profile-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}
.loader {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.profile-error {
  text-align: center;
  padding: 4rem 0;
}
.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #6366f1;
  color: #fff;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.retry-btn:hover {
  background: #4338ca;
}
.profile-card {
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.07);
  overflow: visible;
  position: relative;
}
.cover-photo-wrapper {
  height: 180px;
  position: relative;
  border-top-left-radius: 1.5rem;
  border-top-right-radius: 1.5rem;
  overflow: hidden;
}
.cover-photo {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}
.cover-gradient {
  background: linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%);
}
.profile-pic-wrapper {
  position: absolute;
  left: 50%;
  top: 120px;
  transform: translateX(-50%);
  z-index: 2;
}
.profile-pic-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 5px solid #fff;
  box-shadow: 0 4px 16px 0 rgba(99,102,241,0.15);
  background: #fff;
}
.profile-pic-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-pic-gradient {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #a5b4fc 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  border: 5px solid #fff;
  box-shadow: 0 4px 16px 0 rgba(99,102,241,0.15);
}
.profile-main-info {
  margin-top: 70px;
  padding: 1.5rem 2rem 2rem 2rem;
  text-align: center;
}
.profile-main-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.profile-name {
  font-size: 2rem;
  font-weight: 700;
  color: #22223b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.verified-badge {
  color: #6366f1;
  vertical-align: middle;
  display: inline-flex;
  align-items: center;
}
.profile-username {
  color: #6366f1;
  font-size: 1.1rem;
  margin-top: 0.2rem;
  font-weight: 500;
}
.follow-btn {
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px 0 rgba(99,102,241,0.10);
}
.follow-btn:hover {
  background: #4338ca;
}
.profile-bio {
  margin: 1.2rem 0 0.5rem 0;
  color: #444;
  font-size: 1.1rem;
  font-weight: 400;
}
.profile-stats-row {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  margin-top: 1.5rem;
}
.stat {
  text-align: center;
}
.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #22223b;
}
.stat-label {
  font-size: 0.95rem;
  color: #6366f1;
  font-weight: 500;
}
@media (max-width: 600px) {
  .profile-container {
    padding: 0.5rem 0 2rem 0;
  }
  .profile-main-info {
    padding: 1rem 0.5rem 1.5rem 0.5rem;
  }
  .profile-stats-row {
    gap: 1.2rem;
  }
  .profile-pic-wrapper {
    top: 90px;
  }
  .profile-pic-img, .profile-pic-gradient {
    width: 90px;
    height: 90px;
    font-size: 1.5rem;
  }
}
</style> 