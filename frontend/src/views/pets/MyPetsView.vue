<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth';
import MainLayout from '../../components/layouts/MainLayout.vue';
import CreatePetProfileView from './CreatePetProfileView.vue';

interface PetProfile {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  gender?: string;
  size?: string;
  color?: string;
  description?: string;
  profilePicture?: string;
  isAdoptable: boolean;
  createdAt: string;
}

const authStore = useAuthStore();
const pets = ref<PetProfile[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const showCreatePetModal = ref(false);

const fetchPets = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get('/api/pet/profiles', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (response.data.success) {
      pets.value = response.data.data;
    } else {
      error.value = response.data.message || 'Failed to fetch pets.';
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'An unexpected error occurred.';
    console.error('Error fetching pets:', err);
  } finally {
    isLoading.value = false;
  }
};

const openCreatePetModal = () => {
  showCreatePetModal.value = true;
};

const closeCreatePetModal = () => {
  showCreatePetModal.value = false;
};

const handlePetCreated = () => {
  closeCreatePetModal();
  fetchPets(); // Refresh the pets list
};

const toggleAdoptableStatus = async (petId: string, currentStatus: boolean) => {
  try {
    const response = await axios.patch(`/api/pet/profile/${petId}/adoptable`, 
      { isAdoptable: !currentStatus },
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    );
    if (response.data.success) {
      await fetchPets(); // Refresh the list to show updated status
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Failed to update adoptable status.';
  }
};

onMounted(() => {
  fetchPets();
});
</script>

<template>
  <MainLayout>
    <div class="my-pets-page">
      <div class="page-header">
        <h1 class="page-title">My Pets</h1>
        <button @click="openCreatePetModal" class="create-pet-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add New Pet
        </button>
      </div>

      <div v-if="isLoading" class="loading-indicator">Loading your pets...</div>
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <div v-if="pets.length > 0" class="pets-grid">
        <div v-for="pet in pets" :key="pet.id" class="pet-card">
          <div class="pet-image-container">
            <img 
              :src="pet.profilePicture || '/placeholder-pet.jpg'" 
              :alt="pet.name"
              class="pet-image"
            />
            <div class="pet-status" :class="{ 'adoptable': pet.isAdoptable }">
              {{ pet.isAdoptable ? 'Up for Adoption' : 'Not for Adoption' }}
            </div>
          </div>
          <div class="pet-content">
            <h2 class="pet-name">{{ pet.name }}</h2>
            <div class="pet-details">
              <p><strong>Species:</strong> {{ pet.species }}</p>
              <p v-if="pet.breed"><strong>Breed:</strong> {{ pet.breed }}</p>
              <p v-if="pet.age"><strong>Age:</strong> {{ pet.age }} years</p>
              <p v-if="pet.gender"><strong>Gender:</strong> {{ pet.gender }}</p>
              <p v-if="pet.size"><strong>Size:</strong> {{ pet.size }}</p>
              <p v-if="pet.color"><strong>Color:</strong> {{ pet.color }}</p>
            </div>
            <p v-if="pet.description" class="pet-description">{{ pet.description }}</p>
            <div class="pet-actions">
              <router-link :to="`/pet/${pet.id}/edit`" class="edit-btn">Edit Profile</router-link>
              <button 
                @click="toggleAdoptableStatus(pet.id, pet.isAdoptable)"
                class="toggle-adoption-btn"
                :class="{ 'adoptable': pet.isAdoptable }"
              >
                {{ pet.isAdoptable ? 'Remove from Adoption' : 'Put up for Adoption' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="!isLoading && !error" class="empty-pets">
        You haven't added any pets yet. Click the "Add New Pet" button to get started!
      </div>
    </div>

    <!-- Create Pet Modal -->
    <div v-if="showCreatePetModal" class="modal-overlay" @click.self="closeCreatePetModal">
      <div class="modal-content">
        <button @click="closeCreatePetModal" class="modal-close-btn">&times;</button>
        <CreatePetProfileView @petCreated="handlePetCreated" />
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.my-pets-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #333;
}

.create-pet-btn {
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

.create-pet-btn:hover {
  background: linear-gradient(90deg, #ff7eb3 0%, #ff5e9c 100%);
}

.create-pet-btn .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.loading-indicator, .empty-pets {
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

.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.pet-card {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pet-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.pet-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.pet-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.pet-card:hover .pet-image {
  transform: scale(1.05);
}

.pet-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
}

.pet-status.adoptable {
  background: rgba(255, 94, 156, 0.9);
  color: white;
}

.pet-content {
  padding: 1.5rem;
}

.pet-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
}

.pet-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.pet-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.pet-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.edit-btn, .toggle-adoption-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  background-color: #f3f4f6;
  color: #374151;
  text-decoration: none;
  border: none;
}

.edit-btn:hover {
  background-color: #e5e7eb;
}

.toggle-adoption-btn {
  background-color: #fff0f7;
  color: #ff5e9c;
  border: 1px solid #ff5e9c;
}

.toggle-adoption-btn:hover {
  background-color: #ffe0ef;
}

.toggle-adoption-btn.adoptable {
  background-color: #ff5e9c;
  color: white;
}

.toggle-adoption-btn.adoptable:hover {
  background-color: #ff4b8d;
}

/* Modal styles */
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
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 600px;
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
  z-index: 10;
}

.modal-close-btn:hover {
  color: #333;
}
</style> 