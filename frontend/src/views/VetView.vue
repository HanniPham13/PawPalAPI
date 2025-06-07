<template>
  <div class="vet-dashboard">
    <!-- Header Section -->
    <header class="dashboard-header">
      <div class="header-content">
        <h1>Vet Dashboard</h1>
        <div class="header-actions">
          <button @click="showCreateClinicModal = true" class="btn-primary">
            <i class="fas fa-plus"></i>
            Add New Clinic
          </button>
          <button @click="handleLogout" class="btn-secondary">
            <i class="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Stats Overview -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-hospital"></i>
        </div>
        <div class="stat-content">
          <h3>Total Clinics</h3>
          <p class="stat-number">{{ clinics.length }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>Active Clinics</h3>
          <p class="stat-number">{{ activeClinics.length }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <h3>Total Appointments</h3>
          <p class="stat-number">{{ totalAppointments }}</p>
        </div>
      </div>
    </div>

    <!-- Clinics List -->
    <div class="clinics-section">
      <h2>My Clinics</h2>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loader"></div>
        <p>Loading clinics...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button @click="loadClinics" class="btn-retry">Retry</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="clinics.length === 0" class="empty-state">
        <i class="fas fa-hospital-alt"></i>
        <p>You haven't added any clinics yet</p>
        <button @click="showCreateClinicModal = true" class="btn-primary">
          Add Your First Clinic
        </button>
      </div>

      <!-- Clinics Grid -->
      <div v-else class="clinics-grid">
        <div v-for="clinic in clinics" :key="clinic.id" class="clinic-card">
          <div
            class="clinic-cover"
            :style="{
              backgroundImage: `url(${
                clinic.coverPictureUrl || '/default-clinic-cover.jpg'
              })`,
            }"
          >
            <div class="clinic-status" :class="clinic.status.toLowerCase()">
              {{ clinic.status }}
            </div>
          </div>
          <div class="clinic-profile">
            <img
              :src="clinic.profilePictureUrl || '/default-clinic-profile.jpg'"
              alt="Clinic Profile"
            />
          </div>
          <div class="clinic-details">
            <h3>{{ clinic.name }}</h3>
            <p class="clinic-address">
              <i class="fas fa-map-marker-alt"></i>
              {{ clinic.address.city }}, {{ clinic.address.state }}
            </p>
            <p class="clinic-contact">
              <i class="fas fa-phone"></i>
              {{ clinic.phone }}
            </p>
          </div>
          <div class="clinic-actions">
            <button @click="editClinic(clinic)" class="btn-edit">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button
              @click="toggleClinicStatus(clinic)"
              :class="['btn-status', clinic.status.toLowerCase()]"
            >
              <i
                :class="
                  clinic.status === 'ACTIVE'
                    ? 'fas fa-toggle-on'
                    : 'fas fa-toggle-off'
                "
              ></i>
              {{ clinic.status === "ACTIVE" ? "Active" : "Inactive" }}
            </button>
            <button @click="confirmDeleteClinic(clinic)" class="btn-delete">
              <i class="fas fa-trash-alt"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Clinic Modal -->
    <div v-if="showCreateClinicModal || editingClinic" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingClinic ? "Edit Clinic" : "Add New Clinic" }}</h2>
          <button @click="closeModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit" class="clinic-form">
            <!-- Basic Information -->
            <div class="form-section">
              <h3>Basic Information</h3>
              <div class="form-group">
                <label for="name">Clinic Name*</label>
                <input
                  id="name"
                  v-model="clinicForm.name"
                  type="text"
                  required
                  placeholder="Enter clinic name"
                />
              </div>
              <div class="form-group">
                <label for="description">Description</label>
                <textarea
                  id="description"
                  v-model="clinicForm.description"
                  rows="3"
                  placeholder="Describe your clinic"
                ></textarea>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="form-section">
              <h3>Contact Information</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="phone">Phone Number</label>
                  <input
                    id="phone"
                    v-model="clinicForm.phone"
                    type="tel"
                    placeholder="Enter phone number"
                  />
                </div>
                <div class="form-group">
                  <label for="email">Email</label>
                  <input
                    id="email"
                    v-model="clinicForm.email"
                    type="email"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <div class="form-group">
                <label for="website">Website</label>
                <input
                  id="website"
                  v-model="clinicForm.website"
                  type="url"
                  placeholder="Enter website URL"
                />
              </div>
            </div>

            <!-- Address -->
            <div class="form-section">
              <h3>Address*</h3>
              <div class="form-group">
                <label for="street">Street Address</label>
                <input
                  id="street"
                  v-model="clinicForm.address.address"
                  type="text"
                  required
                  placeholder="Enter street address"
                />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="city">City</label>
                  <input
                    id="city"
                    v-model="clinicForm.address.city"
                    type="text"
                    required
                    placeholder="Enter city"
                  />
                </div>
                <div class="form-group">
                  <label for="state">State</label>
                  <input
                    id="state"
                    v-model="clinicForm.address.state"
                    type="text"
                    required
                    placeholder="Enter state"
                  />
                </div>
                <div class="form-group">
                  <label for="zipCode">ZIP Code</label>
                  <input
                    id="zipCode"
                    v-model="clinicForm.address.zipCode"
                    type="text"
                    required
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>
            </div>

            <!-- Operating Hours -->
            <div class="form-section">
              <h3>Operating Hours</h3>
              <div class="form-group">
                <label for="operatingHours">Hours of Operation</label>
                <textarea
                  id="operatingHours"
                  v-model="clinicForm.operatingHours"
                  rows="2"
                  placeholder="e.g., Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                ></textarea>
              </div>
            </div>

            <!-- Images -->
            <div class="form-section">
              <h3>Clinic Images</h3>
              <div class="form-group">
                <label>Profile Picture</label>
                <div class="image-upload">
                  <input
                    type="file"
                    ref="profilePicture"
                    @change="handleProfilePictureUpload"
                    accept="image/*"
                  />
                  <div class="upload-preview" v-if="profilePreview">
                    <img :src="profilePreview" alt="Profile Preview" />
                  </div>
                  <button
                    type="button"
                    class="btn-upload"
                    @click="triggerProfileUpload"
                  >
                    <i class="fas fa-upload"></i>
                    Upload Profile Picture
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label>Cover Image</label>
                <div class="image-upload">
                  <input
                    type="file"
                    ref="coverPicture"
                    @change="handleCoverPictureUpload"
                    accept="image/*"
                  />
                  <div class="upload-preview" v-if="coverPreview">
                    <img :src="coverPreview" alt="Cover Preview" />
                  </div>
                  <button
                    type="button"
                    class="btn-upload"
                    @click="triggerCoverUpload"
                  >
                    <i class="fas fa-upload"></i>
                    Upload Cover Image
                  </button>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                {{ editingClinic ? "Save Changes" : "Create Clinic" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal delete-modal">
        <div class="modal-header">
          <h2>Delete Clinic</h2>
          <button @click="showDeleteModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to delete
            <strong>{{ clinicToDelete?.name }}</strong
            >?
          </p>
          <p class="warning">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn-secondary">
            Cancel
          </button>
          <button @click="deleteClinic" class="btn-danger">
            Delete Clinic
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
import type { ClinicData } from "../types/clinic";

const router = useRouter();
const toast = useToast();
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:6600";

// State
const clinics = ref<ClinicData[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showCreateClinicModal = ref(false);
const showDeleteModal = ref(false);
const editingClinic = ref<ClinicData | null>(null);
const clinicToDelete = ref<ClinicData | null>(null);
const profilePreview = ref<string | null>(null);
const coverPreview = ref<string | null>(null);

// Form refs
const profilePicture = ref<HTMLInputElement | null>(null);
const coverPicture = ref<HTMLInputElement | null>(null);

// Computed
const activeClinics = computed(() => {
  return clinics.value.filter((clinic) => clinic.status === "ACTIVE");
});

const totalAppointments = computed(() => {
  // TODO: Implement actual appointment counting
  return 0;
});

// Initial clinic form state
const initialClinicForm = {
  name: "",
  description: "",
  phone: "",
  email: "",
  website: "",
  operatingHours: "",
  address: {
    address: "",
    city: "",
    state: "",
    zipCode: "",
  },
};

const clinicForm = ref({ ...initialClinicForm });

// Methods
const loadClinics = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await axios.get(`${API_BASE_URL}/api/vet/clinics`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.data.success) {
      clinics.value = response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load clinics";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async (event: Event) => {
  event.preventDefault();
  loading.value = true;

  try {
    const formData = new FormData();

    // Append basic form data
    Object.entries(clinicForm.value).forEach(([key, value]) => {
      if (key === "address") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value as string);
      }
    });

    // Append files if they exist
    if (profilePicture.value?.files?.[0]) {
      formData.append("profilePicture", profilePicture.value.files[0]);
    }
    if (coverPicture.value?.files?.[0]) {
      formData.append("coverPicture", coverPicture.value.files[0]);
    }

    const url = editingClinic.value
      ? `${API_BASE_URL}/api/vet/clinics/${editingClinic.value.id}`
      : `${API_BASE_URL}/api/vet/clinics`;

    const method = editingClinic.value ? "put" : "post";

    const response = await axios({
      method,
      url,
      data: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      toast.success(
        editingClinic.value
          ? "Clinic updated successfully"
          : "Clinic created successfully"
      );
      await loadClinics();
      closeModal();
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save clinic";
    toast.error(message);
  } finally {
    loading.value = false;
  }
};

const editClinic = (clinic: ClinicData) => {
  editingClinic.value = clinic;
  clinicForm.value = { ...clinic };
  profilePreview.value = clinic.profilePictureUrl || null;
  coverPreview.value = clinic.coverPictureUrl || null;
};

const confirmDeleteClinic = (clinic: ClinicData) => {
  clinicToDelete.value = clinic;
  showDeleteModal.value = true;
};

const deleteClinic = async () => {
  if (!clinicToDelete.value) return;

  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/vet/clinics/${clinicToDelete.value.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.data.success) {
      toast.success("Clinic deleted successfully");
      await loadClinics();
      showDeleteModal.value = false;
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete clinic";
    toast.error(message);
  }
};

const toggleClinicStatus = async (clinic: ClinicData) => {
  try {
    const newStatus = clinic.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const response = await axios.patch(
      `${API_BASE_URL}/api/vet/clinics/${clinic.id}/status`,
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.data.success) {
      toast.success("Clinic status updated successfully");
      await loadClinics();
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update clinic status";
    toast.error(message);
  }
};

const handleProfilePictureUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    profilePreview.value = URL.createObjectURL(file);
  }
};

const handleCoverPictureUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    coverPreview.value = URL.createObjectURL(file);
  }
};

const triggerProfileUpload = () => {
  profilePicture.value?.click();
};

const triggerCoverUpload = () => {
  coverPicture.value?.click();
};

const closeModal = () => {
  showCreateClinicModal.value = false;
  editingClinic.value = null;
  clinicForm.value = { ...initialClinicForm };
  profilePreview.value = null;
  coverPreview.value = null;
  if (profilePicture.value) profilePicture.value.value = "";
  if (coverPicture.value) coverPicture.value.value = "";
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  toast.success("Logged out successfully");
  router.push("/login");
};

// Load clinics on mount
onMounted(() => {
  loadClinics();
});
</script>

<style scoped>
.vet-dashboard {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem;
}

/* Header Styles */
.dashboard-header {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 1.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-card:nth-child(1) .stat-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.stat-card:nth-child(2) .stat-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-card:nth-child(3) .stat-icon {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
}

.stat-content h3 {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0.25rem 0 0 0;
}

/* Clinics Section */
.clinics-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.clinics-section h2 {
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
}

.clinics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Clinic Card */
.clinic-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.clinic-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.clinic-cover {
  height: 120px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.clinic-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.clinic-status.active {
  background: #dcfce7;
  color: #16a34a;
}

.clinic-status.inactive {
  background: #fee2e2;
  color: #dc2626;
}

.clinic-profile {
  margin-top: -40px;
  padding: 0 1.5rem;
}

.clinic-profile img {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  border: 4px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.clinic-details {
  padding: 1rem 1.5rem;
}

.clinic-details h3 {
  font-size: 1.125rem;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.clinic-address,
.clinic-contact {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clinic-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 0.75rem;
}

/* Buttons */
.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-edit,
.btn-status,
.btn-delete {
  flex: 1;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: #f8fafc;
  color: #3b82f6;
  border: 1px solid #e2e8f0;
}

.btn-edit:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.btn-status.active {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #dcfce7;
}

.btn-status.inactive {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
}

.btn-delete {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
}

.btn-delete:hover {
  background: #fee2e2;
  border-color: #fecaca;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h2 {
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Form */
.clinic-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section h3 {
  font-size: 1rem;
  color: #1e293b;
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

input,
textarea {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1e293b;
  transition: all 0.2s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.image-upload {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-upload input[type="file"] {
  display: none;
}

.upload-preview {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
}

.upload-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-upload {
  background: #f8fafc;
  color: #3b82f6;
  border: 1px dashed #e2e8f0;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-upload:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* States */
.loading-state,
.error-state,
.empty-state {
  padding: 3rem;
  text-align: center;
  color: #64748b;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-radius: 50%;
  border-top-color: #3b82f6;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state i,
.empty-state i {
  font-size: 3rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.btn-retry {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  margin-top: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry:hover {
  background: #2563eb;
}

.warning {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .vet-dashboard {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .clinics-grid {
    grid-template-columns: 1fr;
  }

  .clinic-actions {
    flex-direction: column;
  }

  .modal {
    margin: 0;
    max-height: 100vh;
    border-radius: 0;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }

  .clinic-profile {
    text-align: center;
  }

  .clinic-details {
    text-align: center;
  }

  .clinic-address,
  .clinic-contact {
    justify-content: center;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    padding: 1rem;
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
