<script setup lang="ts">
import { ref, reactive, onMounted, computed, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth';

interface PetProfile {
  id: string;
  name: string;
  species?: string;
  breed?: string;
  age?: number | string; // Age can be number or string like "Adult"
  gender?: string;
  size?: string;
  color?: string;
  profilePicture?: string; // For displaying pet's image
  description?: string; // Pet's own bio/description
}

// Enums for direct pet input - ideally, these would come from a shared types definition
const PetSpeciesEnum = ['DOG', 'CAT', 'BIRD', 'REPTILE', 'SMALL_ANIMAL', 'OTHER'];
const PetGenderEnum = ['MALE', 'FEMALE', 'UNKNOWN'];
const PetSizeEnum = ['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'];

const router = useRouter();
const authStore = useAuthStore();
const emit = defineEmits(['postCreated']);

const formData = reactive({
  title: '',
  description: '', // This will be for the adoption post message
  location: '',
  petProfileId: null as string | null,
  // Fields for when not linking an existing pet
  petName: '',
  petSpecies: null as string | null,
  petBreed: '',
  petAge: '',
  petGender: null as string | null,
  petSize: null as string | null,
  petColor: '',
});

const userPets = ref<PetProfile[]>([]);
const selectedFiles = ref<File[]>([]);
const imagePreviews = ref<string[]>([]);
const isLoading = ref(false);
const isLoadingPets = ref(false);
const formError = ref<string | null>(null);
const formSuccess = ref<string | null>(null);

const selectedPetDetails = computed(() => {
  if (formData.petProfileId && userPets.value.length > 0) {
    return userPets.value.find(pet => pet.id === formData.petProfileId) || null;
  }
  return null;
});

const showDirectPetInput = computed(() => {
  return formData.petProfileId === null;
});

const fetchUserPets = async () => {
  if (!authStore.user?.id) return;
  isLoadingPets.value = true;
  try {
    // IMPORTANT: Ensure this endpoint returns all necessary fields for PetProfile interface
    const response = await axios.get(`/api/pets/user/${authStore.user.id}`);
    if (response.data.success) {
      userPets.value = response.data.data;
    } else {
      console.warn('Could not fetch user pets:', response.data.message);
      userPets.value = [];
    }
  } catch (error) {
    console.error('Error fetching user pets:', error);
    userPets.value = [];
  } finally {
    isLoadingPets.value = false;
  }
};

const handleFileChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (files) {
    if (selectedFiles.value.length + files.length > 5) {
      formError.value = 'You can upload a maximum of 5 images.';
      return;
    }
    formError.value = null;
    Array.from(files).forEach(file => {
      if (selectedFiles.value.length < 5) {
        selectedFiles.value.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            imagePreviews.value.push(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
};

const removeImage = (index: number) => {
  selectedFiles.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
};

const handleSubmit = async () => {
  formError.value = null;
  formSuccess.value = null;
  if (!formData.title || !formData.description) {
    formError.value = 'Post Title and Adoption Post Description are required.';
    return;
  }
  if (showDirectPetInput.value && !formData.petName) {
    formError.value = "Pet's Name is required if not linking an existing pet.";
    return;
  }
  // Add more validation for direct pet input fields if needed (e.g., species)

  isLoading.value = true;
  const submissionData = new FormData();
  submissionData.append('title', formData.title);
  submissionData.append('description', formData.description);
  if (formData.location) {
    submissionData.append('location', formData.location);
  }
  
  if (formData.petProfileId) {
    submissionData.append('petProfileId', formData.petProfileId);
  } else {
    // Append direct pet details if no existing pet is linked
    if(formData.petName) submissionData.append('petName', formData.petName);
    if(formData.petSpecies) submissionData.append('petSpecies', formData.petSpecies);
    if(formData.petBreed) submissionData.append('petBreed', formData.petBreed);
    if(formData.petAge) submissionData.append('petAge', formData.petAge);
    if(formData.petGender) submissionData.append('petGender', formData.petGender);
    if(formData.petSize) submissionData.append('petSize', formData.petSize);
    if(formData.petColor) submissionData.append('petColor', formData.petColor);
  }

  selectedFiles.value.forEach(file => {
    submissionData.append('rehomingImage', file);
  });

  try {
    const response = await axios.post('/api/user/adoption-posts', submissionData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${authStore.token}`
      }
    });

    if (response.data.success) {
      formSuccess.value = 'Adoption post created successfully!';
      // Reset form fields
      formData.title = '';
      formData.description = '';
      formData.location = '';
      formData.petProfileId = null;
      formData.petName = '';
      formData.petSpecies = null;
      formData.petBreed = '';
      formData.petAge = '';
      formData.petGender = null;
      formData.petSize = null;
      formData.petColor = '';
      selectedFiles.value = [];
      imagePreviews.value = [];
      emit('postCreated');
    } else {
      formError.value = response.data.message || 'Failed to create adoption post.';
    }
  } catch (error: any) {
    console.error('Error creating adoption post:', error);
    formError.value = error.response?.data?.message || 'An unexpected error occurred.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchUserPets();
});
</script>

<template>
  <div class="create-adoption-post-bg">
    <div class="container">
      <div class="form-card">
        <h1 class="form-title">Put a Pet Up for Adoption</h1>
        <p class="form-subtitle">
          Fill in the details below to find a new loving home for a pet.
        </p>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Title -->
          <div class="form-group">
            <label for="title" class="form-label">Post Title*</label>
            <input id="title" v-model="formData.title" type="text" class="form-input" required />
          </div>

          <!-- Link Existing Pet -->
          <div class="form-group">
            <label for="petProfileId" class="form-label">Link an Existing Pet (Optional)</label>
            <select id="petProfileId" v-model="formData.petProfileId" class="form-input">
              <option :value="null">Don't link a pet / Pet not listed here</option>
              <option v-if="isLoadingPets" :value="null" disabled>Loading your pets...</option>
              <template v-else-if="userPets.length > 0">
                <option v-for="pet in userPets" :key="pet.id" :value="pet.id">
                  {{ pet.name }} <span v-if="pet.species"> ({{ pet.species }})</span>
                </option>
              </template>
              <option v-else :value="null" disabled>You have no registered pets.</option>
            </select>
            <p class="form-hint">
              If you select one of your pets, its details will be shown on the adoption post and it will be marked as "Up for Adoption".
            </p>
          </div>
          
          <!-- Display Selected Pet Details -->
          <div v-if="selectedPetDetails" class="selected-pet-details form-group">
            <h3 class="details-header">Selected Pet: {{ selectedPetDetails.name }}</h3>
            <div class="details-grid">
              <div v-if="selectedPetDetails.profilePicture" class="pet-image-container">
                  <img :src="selectedPetDetails.profilePicture" alt="Pet image" class="pet-image"/>
              </div>
              <div class="pet-info-grid">
                  <div v-if="selectedPetDetails.species"><strong class="detail-label">Species:</strong> {{ selectedPetDetails.species }}</div>
                  <div v-if="selectedPetDetails.breed"><strong class="detail-label">Breed:</strong> {{ selectedPetDetails.breed }}</div>
                  <div v-if="selectedPetDetails.age"><strong class="detail-label">Age:</strong> {{ selectedPetDetails.age }}</div>
                  <div v-if="selectedPetDetails.gender"><strong class="detail-label">Gender:</strong> {{ selectedPetDetails.gender }}</div>
                  <div v-if="selectedPetDetails.size"><strong class="detail-label">Size:</strong> {{ selectedPetDetails.size }}</div>
                  <div v-if="selectedPetDetails.color"><strong class="detail-label">Color:</strong> {{ selectedPetDetails.color }}</div>
              </div>
            </div>
            <div v-if="selectedPetDetails.description" class="pet-bio">
              <strong class="detail-label">Pet's Bio:</strong>
              <p>{{ selectedPetDetails.description }}</p>
            </div>
          </div>

          <!-- Direct Pet Input Fields (if no existing pet linked) -->
          <div v-if="showDirectPetInput" class="direct-pet-input-section form-group">
            <h3 class="details-header">Enter Pet Details Manually</h3>
            <div class="grid-halves">
              <div class="form-group">
                <label for="petName" class="form-label">Pet's Name*</label>
                <input id="petName" v-model="formData.petName" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label for="petSpecies" class="form-label">Species</label>
                <select id="petSpecies" v-model="formData.petSpecies" class="form-input">
                  <option :value="null">Select Species</option>
                  <option v-for="species in PetSpeciesEnum" :key="species" :value="species">{{ species }}</option>
                </select>
              </div>
            </div>
            <div class="grid-halves">
              <div class="form-group">
                <label for="petBreed" class="form-label">Breed</label>
                <input id="petBreed" v-model="formData.petBreed" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label for="petAge" class="form-label">Age (e.g., 2 years, 6 months)</label>
                <input id="petAge" v-model="formData.petAge" type="text" class="form-input" />
              </div>
            </div>
            <div class="grid-halves">
               <div class="form-group">
                <label for="petGender" class="form-label">Gender</label>
                <select id="petGender" v-model="formData.petGender" class="form-input">
                  <option :value="null">Select Gender</option>
                  <option v-for="gender in PetGenderEnum" :key="gender" :value="gender">{{ gender }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="petSize" class="form-label">Size</label>
                <select id="petSize" v-model="formData.petSize" class="form-input">
                  <option :value="null">Select Size</option>
                  <option v-for="size in PetSizeEnum" :key="size" :value="size">{{ size }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="petColor" class="form-label">Color</label>
              <input id="petColor" v-model="formData.petColor" type="text" class="form-input" />
            </div>
          </div>

          <!-- Adoption Post Description -->
          <div class="form-group">
            <label for="description" class="form-label">Adoption Post Description*</label>
            <textarea id="description" v-model="formData.description" rows="4" class="form-input" placeholder="Tell us about why this pet needs a new home, its personality, and what kind of family would be a good fit..." required></textarea>
          </div>

          <!-- Location -->
          <div class="form-group">
            <label for="location" class="form-label">Current Location (e.g., City, State)</label>
            <input id="location" v-model="formData.location" type="text" class="form-input" />
          </div>

          <!-- Image Upload for Adoption Post -->
          <div class="form-group">
            <label class="form-label">Adoption Post Images (Up to 5)</label>
            <input type="file" @change="handleFileChange" multiple accept="image/*" class="file-input" />
            <div v-if="imagePreviews.length > 0" class="image-previews">
              <div v-for="(preview, index) in imagePreviews" :key="index" class="preview-item">
                <img :src="preview" alt="Image preview" />
                <button type="button" @click="removeImage(index)" class="remove-img-btn">✕</button>
              </div>
            </div>
          </div>

          <!-- Error/Success Messages -->
          <div v-if="formError" class="error-message">
            {{ formError }}
          </div>
          <div v-if="formSuccess" class="success-message">
            {{ formSuccess }}
          </div>

          <div class="form-actions">
            <button type="button" @click="router.go(-1)" class="cancel-btn" :disabled="isLoading">
              Cancel
            </button>
            <button type="submit" class="submit-btn" :disabled="isLoading">
              {{ isLoading ? 'Creating Post...' : 'Create Post' }}
            </button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<style scoped>
.create-adoption-post-bg {
  background: linear-gradient(135deg, #f5f7fa 0%, #e0eafc 100%);
  padding: 2rem 0;
}

.container {
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

.form-card {
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  padding: 2rem 2.5rem;
}

.form-title {
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #2c3e50; 
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.form-subtitle {
  text-align: center;
  margin-bottom: 1.5rem; /* Reduced margin */
  color: #555;
  font-size: 1rem;
}

.space-y-6 > * + * {
 margin-top: 1.5rem;
}

.form-group {
  /* margin-bottom: 1.5rem; Handled by space-y-6 */
}

.form-label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-input, .file-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1.5px solid #d1d5db; /* Tailwind gray-300 */
  background: #f9fafb; /* Tailwind gray-50 */
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box; /* Ensure padding doesn't expand element */
}

.form-input:focus {
  border-color: #ff7eb3; /* Pink accent */
  box-shadow: 0 0 0 3px rgba(255, 126, 179, 0.2);
  outline: none;
  background: #fff;
}

.file-input {
  padding: 0.5rem;
}

.form-hint {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.3rem;
}

.image-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #ddd;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-img-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  cursor: pointer;
  font-weight: bold;
}

.error-message {
  background: #ffebee; /* Light red */
  color: #c62828; /* Dark red */
  border-left: 4px solid #ef5350; /* Red */
  padding: 0.8rem 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  font-size: 0.95rem;
}

.success-message {
  background: #e8f5e9; /* Light green */
  color: #2e7d32; /* Dark green */
  border-left: 4px solid #66bb6a; /* Green */
  padding: 0.8rem 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  font-size: 0.95rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #555;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.cancel-btn:disabled,
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn {
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 94, 156, 0.2);
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
  box-shadow: 0 6px 16px rgba(255, 94, 156, 0.25);
}

.selected-pet-details,
.direct-pet-input-section {
  background-color: #f8f9fa; /* Light gray background */
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border: 1px solid #e9ecef;
}

.details-header {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ff5e9c; /* Pink accent */
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ffe0ef;
}

.details-grid {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
}

.pet-image-container {
    flex-shrink: 0;
    width: 120px; /* Fixed width for pet image */
    height: 120px;
}

.pet-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 2px solid #ffe0ef;
}

.pet-info-grid {
    flex-grow: 1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); /* Responsive columns */
    gap: 0.75rem;
    font-size: 0.95rem;
}

.detail-label {
  font-weight: 600;
  color: #333;
}

.pet-bio {
  margin-top: 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #444;
}
.pet-bio p {
    margin-top: 0.25rem;
    padding-left: 0.5rem;
    border-left: 3px solid #ffe0ef;
}

.grid-halves {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.grid-halves .form-group {
  margin-bottom: 0; /* Remove default bottom margin from form-group inside grid */
}

/* Adjust form group spacing if needed */
.space-y-6 > * + * {
 margin-top: 1.25rem; /* Reduced spacing between main form groups */
}

.form-label {
  font-size: 0.9rem; /* Adjusted label size */
}
</style> 