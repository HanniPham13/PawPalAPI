<script setup lang="ts">
import { ref, reactive } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth';

const emit = defineEmits(['petCreated']);
const authStore = useAuthStore();

const formData = reactive({
  name: '',
  species: '',
  breed: '',
  age: '',
  gender: '',
  size: '',
  color: '',
  description: ''
});

const profilePicture = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

// Enums for form select options
const speciesOptions = ['DOG', 'CAT', 'BIRD', 'REPTILE', 'SMALL_ANIMAL', 'OTHER'];
const genderOptions = ['MALE', 'FEMALE', 'UNKNOWN'];
const sizeOptions = ['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'];

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    profilePicture.value = input.files[0];
    imagePreview.value = URL.createObjectURL(input.files[0]);
  }
};

const handleSubmit = async () => {
  if (!formData.name || !formData.species) {
    error.value = 'Pet name and species are required.';
    return;
  }

  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('species', formData.species);
    if (formData.breed) submitData.append('breed', formData.breed);
    if (formData.age) submitData.append('age', formData.age.toString());
    if (formData.gender) submitData.append('gender', formData.gender);
    if (formData.size) submitData.append('size', formData.size);
    if (formData.color) submitData.append('color', formData.color);
    if (formData.description) submitData.append('description', formData.description);
    if (profilePicture.value) {
      submitData.append('profilePicture', profilePicture.value);
    }

    const response = await axios.post('/api/pet/profile', submitData, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      success.value = 'Pet profile created successfully!';
      emit('petCreated');
    } else {
      error.value = response.data.message || 'Failed to create pet profile.';
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'An unexpected error occurred.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="create-pet-form">
    <h2 class="form-title">Add a New Pet</h2>
    <form @submit.prevent="handleSubmit" class="form-content">
      <!-- Profile Picture Upload -->
      <div class="form-group">
        <label class="form-label">Profile Picture</label>
        <div class="image-upload-container">
          <div 
            class="image-preview" 
            :class="{ 'has-image': imagePreview }"
            :style="imagePreview ? { backgroundImage: `url(${imagePreview})` } : {}"
          >
            <input 
              type="file" 
              accept="image/*" 
              @change="handleImageChange" 
              class="file-input"
            />
            <div v-if="!imagePreview" class="upload-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" class="upload-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
              </svg>
              <span>Click to upload</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Required Fields -->
      <div class="form-group">
        <label for="name" class="form-label">Pet Name*</label>
        <input 
          id="name"
          v-model="formData.name"
          type="text"
          class="form-input"
          required
          placeholder="Enter your pet's name"
        />
      </div>

      <div class="form-group">
        <label for="species" class="form-label">Species*</label>
        <select 
          id="species"
          v-model="formData.species"
          class="form-input"
          required
        >
          <option value="">Select species</option>
          <option v-for="species in speciesOptions" :key="species" :value="species">
            {{ species.replace('_', ' ') }}
          </option>
        </select>
      </div>

      <!-- Optional Fields -->
      <div class="form-group">
        <label for="breed" class="form-label">Breed</label>
        <input 
          id="breed"
          v-model="formData.breed"
          type="text"
          class="form-input"
          placeholder="Enter breed"
        />
      </div>

      <div class="form-group">
        <label for="age" class="form-label">Age (in years)</label>
        <input 
          id="age"
          v-model="formData.age"
          type="number"
          min="0"
          step="0.5"
          class="form-input"
          placeholder="Enter age"
        />
      </div>

      <div class="form-group">
        <label for="gender" class="form-label">Gender</label>
        <select 
          id="gender"
          v-model="formData.gender"
          class="form-input"
        >
          <option value="">Select gender</option>
          <option v-for="gender in genderOptions" :key="gender" :value="gender">
            {{ gender }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="size" class="form-label">Size</label>
        <select 
          id="size"
          v-model="formData.size"
          class="form-input"
        >
          <option value="">Select size</option>
          <option v-for="size in sizeOptions" :key="size" :value="size">
            {{ size.replace('_', ' ') }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="color" class="form-label">Color</label>
        <input 
          id="color"
          v-model="formData.color"
          type="text"
          class="form-input"
          placeholder="Enter color"
        />
      </div>

      <div class="form-group">
        <label for="description" class="form-label">Description</label>
        <textarea 
          id="description"
          v-model="formData.description"
          class="form-input"
          rows="3"
          placeholder="Tell us about your pet..."
        ></textarea>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="success" class="success-message">{{ success }}</div>

      <button 
        type="submit" 
        class="submit-btn"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Creating...' : 'Create Pet Profile' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.create-pet-form {
  padding: 1rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #ff5e9c;
  box-shadow: 0 0 0 3px rgba(255, 94, 156, 0.1);
}

.image-upload-container {
  width: 100%;
}

.image-preview {
  width: 100%;
  height: 200px;
  border: 2px dashed #e5e7eb;
  border-radius: 0.5rem;
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.image-preview:hover {
  border-color: #ff5e9c;
}

.image-preview.has-image {
  border-style: solid;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.upload-icon {
  width: 2.5rem;
  height: 2.5rem;
}

.error-message {
  padding: 0.75rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.success-message {
  padding: 0.75rem;
  background-color: #e8f5e9;
  color: #2e7d32;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.submit-btn {
  padding: 0.75rem;
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #ff7eb3 0%, #ff5e9c 100%);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style> 