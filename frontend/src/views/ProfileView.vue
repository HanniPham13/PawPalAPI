<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import MainLayout from '../components/layouts/MainLayout.vue'
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'

const authStore = useAuthStore()
const user = ref(authStore.user)
const isLoading = ref(false)
const error = ref('')
const isEditing = ref(false)
const editSuccess = ref(false)

// Form data
const formData = ref({
  firstName: user.value?.firstName || '',
  lastName: user.value?.lastName || '',
  username: user.value?.username || '',
  bio: user.value?.bio || ''
})

// Profile picture upload
const profilePicture = ref<File | null>(null)
const profilePicturePreview = ref('')
const uploadError = ref('')
const isUploading = ref(false)

const fetchProfile = async () => {
  isLoading.value = true
  error.value = ''
  try {
    console.log('[ProfileView] Attempting to fetch profile data...')
    const result = await authStore.fetchUserProfile()
    console.log('[ProfileView] Raw result from authStore.fetchUserProfile():', JSON.parse(JSON.stringify(result)))
    if (!result.success) {
      error.value = result.message || 'Failed to load profile'
      console.error('[ProfileView] Error loading profile from authStore:', error.value, 'Full result:', JSON.parse(JSON.stringify(result)))
    }
    console.log('[ProfileView] authStore.user after fetchUserProfile:', JSON.parse(JSON.stringify(authStore.user)))
    user.value = authStore.user
    console.log('[ProfileView] Local user.value after assignment:', JSON.parse(JSON.stringify(user.value)))

    if (user.value) {
      formData.value = {
        firstName: user.value.firstName || '',
        lastName: user.value.lastName || '',
        username: user.value.username || '',
        bio: user.value.bio || ''
      }
      console.log('[ProfileView] formData.value populated:', JSON.parse(JSON.stringify(formData.value)))
    } else {
      console.warn('[ProfileView] user.value is null or undefined after fetch and assignment.')
      error.value = error.value || 'User data not found after fetch.'
    }
  } catch (err) {
    console.error('[ProfileView] Exception during fetchProfile:', err)
    error.value = 'An error occurred while loading your profile'
  } finally {
    isLoading.value = false
    console.log('[ProfileView] fetchProfile finished. isLoading:', isLoading.value, 'Error:', error.value)
  }
}

onMounted(() => {
  fetchProfile()
})

watch(
  () => authStore.token,
  (newToken) => {
    if (newToken) {
      fetchProfile()
    }
  }
)

const toggleEditMode = () => {
  isEditing.value = !isEditing.value
  editSuccess.value = false
}

const handleProfilePicture = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    profilePicture.value = target.files[0]
    profilePicturePreview.value = URL.createObjectURL(target.files[0])
  }
}

const uploadProfilePicture = async () => {
  if (!profilePicture.value) return
  isUploading.value = true
  uploadError.value = ''
  try {
    const formData = new FormData()
    formData.append('profilePicture', profilePicture.value)
    console.log('Uploading profile picture...')
    const response = await axios.post('/api/user/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    console.log('Profile picture upload response:', response.data)
    if (response.data.success) {
      await authStore.fetchUserProfile()
      user.value = authStore.user
      profilePicture.value = null
    } else {
      uploadError.value = response.data.message || 'Failed to upload profile picture'
      console.error('Upload error:', uploadError.value)
    }
  } catch (err: any) {
    console.error('Exception while uploading profile picture:', err)
    uploadError.value = err.response?.data?.message || 'Failed to upload profile picture'
  } finally {
    isUploading.value = false
  }
}

const updateProfile = async () => {
  isLoading.value = true
  error.value = ''
  editSuccess.value = false
  try {
    console.log('Updating profile with data:', formData.value)
    const response = await axios.patch('/api/user/profile', formData.value, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    console.log('Profile update response:', response.data)
    if (response.data.success) {
      if (profilePicture.value) {
        await uploadProfilePicture()
      }
      await authStore.fetchUserProfile()
      user.value = authStore.user
      editSuccess.value = true
      setTimeout(() => {
        isEditing.value = false
        editSuccess.value = false
      }, 1500)
    } else {
      error.value = response.data.message || 'Failed to update profile'
      console.error('Update error:', error.value)
    }
  } catch (err: any) {
    console.error('Exception while updating profile:', err)
    error.value = err.response?.data?.message || 'Failed to update profile'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="profile-bg">
      <div class="profile-wrapper">
        <div v-if="isLoading" class="profile-loader">
          <div class="loader"></div>
          <p>Loading your profile...</p>
        </div>
        <div v-else-if="error" class="profile-error">
          <p>{{ error }}</p>
          <button @click="fetchProfile" class="retry-btn">Retry</button>
        </div>
        <div v-else-if="user && user.id" class="profile-card">
          <div v-if="isEditing" class="profile-edit-form">
            <h2 class="edit-title">Edit Profile</h2>
            
            <div class="profile-picture-upload">
              <div class="picture-preview">
                <template v-if="profilePicturePreview">
                  <img :src="profilePicturePreview" alt="New profile picture" />
                </template>
                <template v-else-if="user.profile && user.profile.profilePictureUrl">
                  <img :src="user.profile.profilePictureUrl" alt="Current profile picture" />
                </template>
                <template v-else>
                  <div class="profile-avatar-gradient">
                    {{ user.firstName?.charAt(0) }}{{ user.lastName?.charAt(0) }}
                  </div>
                </template>
              </div>
              
              <div class="picture-upload-controls">
                <label for="profile-picture" class="upload-btn">
                  Choose Photo
                  <input 
                    type="file" 
                    id="profile-picture" 
                    accept="image/*"
                    @change="handleProfilePicture"
                    class="hidden-input"
                  />
                </label>
                <span v-if="profilePicture">{{ profilePicture.name }}</span>
              </div>
              
              <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
            </div>
            
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                v-model="formData.firstName" 
                class="form-input" 
                placeholder="Your first name"
              />
            </div>
            
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                v-model="formData.lastName" 
                class="form-input" 
                placeholder="Your last name"
              />
            </div>
            
            <div class="form-group">
              <label for="username">Username</label>
              <input 
                type="text" 
                id="username" 
                v-model="formData.username" 
                class="form-input" 
                placeholder="Your username"
              />
            </div>
            
            <div class="form-group">
              <label for="bio">Bio</label>
              <textarea 
                id="bio" 
                v-model="formData.bio" 
                class="form-textarea" 
                placeholder="Tell us about yourself"
                rows="4"
              ></textarea>
            </div>
            
            <div class="form-actions">
              <button 
                type="button" 
                class="cancel-btn" 
                @click="toggleEditMode"
                :disabled="isLoading"
              >
                Cancel
              </button>
              <button 
                type="button" 
                class="save-btn" 
                @click="updateProfile"
                :disabled="isLoading"
              >
                <span v-if="isLoading">Saving...</span>
                <span v-else>Save Changes</span>
              </button>
            </div>
            
            <div v-if="editSuccess" class="success-message">
              Profile updated successfully!
            </div>
          </div>
          <div v-else>
            <div class="profile-header">
              <template v-if="user.profile && user.profile.profilePictureUrl">
                <div class="profile-avatar-img">
                  <img :src="user.profile.profilePictureUrl" alt="Profile picture" />
                </div>
              </template>
              <template v-else>
                <div class="profile-avatar-gradient">
                  {{ user.firstName?.charAt(0) }}{{ user.lastName?.charAt(0) }}
                </div>
              </template>
              <div class="profile-info">
                <h1 class="profile-name">{{ user.firstName }} {{ user.lastName }}</h1>
                <div class="profile-username">@{{ user.username }}</div>
                <div class="profile-email">{{ user.email }}</div>
                <div v-if="user.bio" class="profile-bio">{{ user.bio }}</div>
              </div>
            </div>
            <div class="profile-actions">
              <button class="edit-profile-btn" @click="toggleEditMode">Edit Profile</button>
            </div>
            <div class="profile-body">
              <p class="profile-desc">Welcome to your PawPal profile! More features coming soon.</p>
            </div>
          </div>
        </div>
        <div v-else class="profile-error">
          <p>No profile data available.</p>
          <button @click="fetchProfile" class="retry-btn">Retry Loading</button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.profile-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff 0%, #ffe0ef 100%);
  padding: 2.5rem 0 0 0;
}
.profile-wrapper {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 1rem;
}
.profile-card {
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 8px 32px 0 rgba(255, 94, 156, 0.10);
  padding: 2.5rem 2rem;
  margin: 0 auto 2.5rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  width: 100%;
}
.profile-avatar-img img, .picture-preview img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2.5px solid #ff7eb3;
  box-shadow: 0 2px 8px 0 rgba(255, 94, 156, 0.10);
}
.profile-avatar-gradient {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7f5fff 0%, #ff7eb3 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 2.8rem;
  box-shadow: 0 2px 8px 0 rgba(127, 95, 255, 0.10);
}
.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
}
.profile-name {
  font-size: 1.5rem;
  font-weight: 900;
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  letter-spacing: 0.03em;
}
.profile-username {
  font-size: 1.1rem;
  color: #b36b8a;
  font-weight: 500;
}
.profile-email {
  font-size: 1rem;
  color: #b36b8a;
  font-weight: 400;
}
.profile-bio {
  margin-top: 0.5rem;
  font-size: 1rem;
  color: #22223b;
  line-height: 1.5;
}
.profile-body {
  margin-top: 1.5rem;
  text-align: center;
  width: 100%;
}
.profile-desc {
  font-size: 1.1rem;
  color: #b36b8a;
  font-weight: 500;
}
.profile-actions {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}
.edit-profile-btn {
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  color: white;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}
.edit-profile-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 94, 156, 0.2);
}

/* Edit profile form styles */
.profile-edit-form {
  width: 100%;
}
.edit-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #22223b;
  text-align: center;
}
.form-group {
  margin-bottom: 1.2rem;
  width: 100%;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #22223b;
}
.form-input, .form-textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}
.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #ff7eb3;
  box-shadow: 0 0 0 3px rgba(255, 126, 179, 0.1);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
.cancel-btn {
  background: #f3f4f6;
  color: #4b5563;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}
.save-btn {
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  color: white;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}
.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 94, 156, 0.2);
}
.save-btn:disabled, .cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Profile picture upload */
.profile-picture-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}
.picture-preview {
  margin-bottom: 1rem;
}
.picture-upload-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.upload-btn {
  background: #ffe0ef;
  color: #ff5e9c;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: inline-block;
}
.hidden-input {
  display: none;
}
.upload-error {
  color: #dc2626;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}
.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #dcfce7;
  color: #166534;
  border-radius: 0.5rem;
  text-align: center;
  font-weight: 500;
}

/* Loading and error styles */
.profile-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: white;
  border-radius: 1.25rem;
  box-shadow: 0 8px 32px 0 rgba(255, 94, 156, 0.10);
}
.loader {
  width: 48px;
  height: 48px;
  border: 4px solid #ffe0ef;
  border-bottom-color: #ff5e9c;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
  margin-bottom: 1rem;
}
.profile-error {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 1.25rem;
  box-shadow: 0 8px 32px 0 rgba(255, 94, 156, 0.10);
  color: #ff5e9c;
}
.retry-btn {
  margin-top: 1rem;
  background: #ffe0ef;
  color: #ff5e9c;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}
@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@media (max-width: 640px) {
  .profile-card {
    padding: 1.5rem 1rem;
  }
  .profile-header {
    flex-direction: column;
    gap: 0.7rem;
    text-align: center;
  }
  .profile-info {
    text-align: center;
  }
  .profile-avatar-img img, .profile-avatar-gradient, .picture-preview img {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }
  .profile-name {
    font-size: 1.4rem;
  }
  .profile-actions {
    justify-content: center;
    margin-top: 1rem;
  }
  .form-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  .cancel-btn, .save-btn {
    width: 100%;
  }
}
</style> 