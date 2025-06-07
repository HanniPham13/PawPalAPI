<script setup lang="ts">
import { ref, reactive } from "vue";
import axios from "axios";
import { useAuthStore } from "../../stores/auth";

const emit = defineEmits(["petCreated"]);
const authStore = useAuthStore();

const formData = reactive({
  name: "",
  species: "",
  breed: "",
  age: "",
  gender: "",
  size: "",
  color: "",
  description: "",
});

const profilePicture = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

// Enums for form select options
const speciesOptions = [
  "DOG",
  "CAT",
  "BIRD",
  "REPTILE",
  "SMALL_ANIMAL",
  "OTHER",
];
const genderOptions = ["MALE", "FEMALE", "UNKNOWN"];
const sizeOptions = ["SMALL", "MEDIUM", "LARGE", "EXTRA_LARGE"];

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    profilePicture.value = input.files[0];
    imagePreview.value = URL.createObjectURL(input.files[0]);
  }
};

const handleSubmit = async () => {
  if (!formData.name || !formData.species) {
    error.value = "Pet name and species are required.";
    return;
  }

  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("species", formData.species);
    if (formData.breed) submitData.append("breed", formData.breed);
    if (formData.age) submitData.append("age", formData.age.toString());
    if (formData.gender) submitData.append("gender", formData.gender);
    if (formData.size) submitData.append("size", formData.size);
    if (formData.color) submitData.append("color", formData.color);
    if (formData.description)
      submitData.append("description", formData.description);
    if (profilePicture.value) {
      submitData.append("profilePicture", profilePicture.value);
    }

    const response = await axios.post("/api/pet/profile", submitData, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      success.value = "Pet profile created successfully!";
      emit("petCreated");
    } else {
      error.value = response.data.message || "Failed to create pet profile.";
    }
  } catch (err: any) {
    error.value =
      err.response?.data?.message ||
      err.message ||
      "An unexpected error occurred.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="create-pet-form">
    <h2 class="form-title">Add New Pet</h2>
    <p class="form-subtitle">
      Enter your pet's details to create their profile.
    </p>

    <div class="form-content">
      <div class="form-group">
        <label class="form-label">Pet Name*</label>
        <input
          v-model="formData.name"
          type="text"
          class="form-input"
          required
          placeholder="Enter pet's name"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Species*</label>
        <select v-model="formData.species" class="form-input" required>
          <option value="">Select species</option>
          <option
            v-for="species in speciesOptions"
            :key="species"
            :value="species"
          >
            {{ species.replace("_", " ") }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Breed</label>
        <input
          v-model="formData.breed"
          type="text"
          class="form-input"
          placeholder="Enter breed"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Age (years)</label>
        <input
          v-model="formData.age"
          type="number"
          class="form-input"
          min="0"
          step="0.1"
          placeholder="Enter age"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Gender</label>
        <select v-model="formData.gender" class="form-input">
          <option value="">Select gender</option>
          <option v-for="gender in genderOptions" :key="gender" :value="gender">
            {{ gender }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Size</label>
        <select v-model="formData.size" class="form-input">
          <option value="">Select size</option>
          <option v-for="size in sizeOptions" :key="size" :value="size">
            {{ size.replace("_", " ") }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Color</label>
        <input
          v-model="formData.color"
          type="text"
          class="form-input"
          placeholder="Enter color"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea
          v-model="formData.description"
          class="form-input"
          rows="3"
          placeholder="Tell us about your pet..."
        ></textarea>
      </div>

      <div class="form-group image-upload-section">
        <label class="form-label">Profile Picture</label>
        <div class="image-upload-container">
          <div
            class="image-preview-area"
            :class="{ 'has-image': imagePreview }"
          >
            <input
              type="file"
              @change="handleImageChange"
              accept="image/*"
              class="file-input"
              id="pet-image"
            />
            <label for="pet-image" class="upload-label">
              <div v-if="!imagePreview" class="upload-placeholder">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="upload-icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Click to upload</span>
              </div>
              <img
                v-else
                :src="imagePreview"
                alt="Preview"
                class="preview-image"
              />
            </label>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? "Creating..." : "Create Pet Profile" }}
        </button>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </form>
</template>

<style scoped>
.create-pet-form {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-align: center;
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-subtitle {
  text-align: center;
  color: #64748b;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  margin: 0;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: #fff;
  transition: all 0.2s ease;
}

.form-input:hover {
  border-color: #cbd5e1;
}

.form-input:focus {
  border-color: #ff5e9c;
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 94, 156, 0.1);
}

.form-input::placeholder {
  color: #94a3b8;
}

select.form-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

.image-upload-section {
  margin-top: 0.5rem;
}

.image-upload-container {
  width: 100%;
}

.image-preview-area {
  width: 100%;
  height: 200px;
  border: 2px dashed #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
  position: relative;
  transition: all 0.2s ease;
}

.image-preview-area:hover {
  border-color: #ff5e9c;
}

.file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.upload-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
}

.upload-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #94a3b8;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.submit-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(90deg, #ff5e9c 0%, #ff7eb3 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 94, 156, 0.25);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  text-align: center;
  border-left: 4px solid #ef4444;
}
</style>
