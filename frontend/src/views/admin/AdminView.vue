<template>
  <div>
    <AdminNavigation />
    <div class="admin-dashboard">
      <div class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p class="subtitle">Manage verifications, documents, and records</p>

        <!-- Stats Overview -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon verification-icon">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="stat-content">
              <h3>Pending Verifications</h3>
              <p class="stat-number">{{ verifications.items.length }}</p>
              <p class="stat-label">Awaiting Review</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon document-icon">
              <i class="fas fa-file-medical"></i>
            </div>
            <div class="stat-content">
              <h3>Vet Documents</h3>
              <p class="stat-number">{{ vetDocuments.items.length }}</p>
              <p class="stat-label">To be Processed</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon record-icon">
              <i class="fas fa-notes-medical"></i>
            </div>
            <div class="stat-content">
              <h3>Medical Records</h3>
              <p class="stat-number">{{ medicalRecords.items.length }}</p>
              <p class="stat-label">Need Attention</p>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <!-- Tabs with icons -->
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['tab-button', { active: currentTab === tab.id }]"
            @click="currentTab = tab.id"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.name }}</span>
          </button>
        </div>

        <!-- Pending Verifications Section -->
        <div v-if="currentTab === 'verifications'" class="section">
          <h2>Pending Verifications</h2>
          <div v-if="isLoading.verifications" class="loading-state">
            <div class="loader"></div>
            <p>Loading verifications...</p>
          </div>
          <div v-else-if="hasError.verifications" class="error-state">
            <p>Failed to load verifications. Please try again.</p>
            <button @click="loadVerifications()" class="btn-retry">
              Retry
            </button>
          </div>
          <div v-else-if="verifications.items.length === 0" class="empty-state">
            <p>No pending verifications found.</p>
          </div>
          <div v-else class="cards-grid">
            <div
              v-for="verification in verifications.items"
              :key="verification.id"
              class="card"
            >
              <div class="card-header">
                <h3>Verification Request</h3>
                <span class="status pending">Pending</span>
              </div>
              <div class="card-content">
                <p><strong>User:</strong> {{ verification.user?.username }}</p>
                <p><strong>Type:</strong> {{ verification.type }}</p>
                <p>
                  <strong>Submitted:</strong>
                  {{ new Date(verification.createdAt).toLocaleDateString() }}
                </p>
              </div>
              <div class="card-actions">
                <button
                  class="btn-approve"
                  @click="approveVerification(verification.id)"
                >
                  Approve
                </button>
                <button
                  class="btn-reject"
                  @click="showRejectModal(verification.id, 'verification')"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
          <div class="pagination">
            <button
              :disabled="verifications.page <= 1"
              @click="loadVerifications(verifications.page - 1)"
            >
              Previous
            </button>
            <span
              >Page {{ verifications.page }} of
              {{ verifications.totalPages }}</span
            >
            <button
              :disabled="verifications.page >= verifications.totalPages"
              @click="loadVerifications(verifications.page + 1)"
            >
              Next
            </button>
          </div>
        </div>

        <!-- Vet Documents Section -->
        <div v-if="currentTab === 'vetDocs'" class="section">
          <h2>Pending Vet Documents</h2>
          <div v-if="isLoading.vetDocs" class="loading-state">
            <div class="loader"></div>
            <p>Loading vet documents...</p>
          </div>
          <div v-else-if="hasError.vetDocs" class="error-state">
            <p>Failed to load vet documents. Please try again.</p>
            <button @click="loadVetDocuments()" class="btn-retry">Retry</button>
          </div>
          <div v-else-if="vetDocuments.items.length === 0" class="empty-state">
            <p>No pending vet documents found.</p>
          </div>
          <div v-else class="cards-grid">
            <div v-for="doc in vetDocuments.items" :key="doc.id" class="card">
              <div class="card-header">
                <h3>Vet Document</h3>
                <span class="status pending">Pending</span>
              </div>
              <div class="card-content">
                <p><strong>Vet:</strong> {{ doc.vet?.username }}</p>
                <p><strong>Document Type:</strong> {{ doc.documentType }}</p>
                <p>
                  <strong>Submitted:</strong>
                  {{ new Date(doc.createdAt).toLocaleDateString() }}
                </p>
              </div>
              <div class="card-actions">
                <button class="btn-approve" @click="approveVetDocument(doc.id)">
                  Approve
                </button>
                <button
                  class="btn-reject"
                  @click="showRejectModal(doc.id, 'vetDoc')"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
          <div class="pagination">
            <button
              :disabled="vetDocuments.page <= 1"
              @click="loadVetDocuments(vetDocuments.page - 1)"
            >
              Previous
            </button>
            <span
              >Page {{ vetDocuments.page }} of
              {{ vetDocuments.totalPages }}</span
            >
            <button
              :disabled="vetDocuments.page >= vetDocuments.totalPages"
              @click="loadVetDocuments(vetDocuments.page + 1)"
            >
              Next
            </button>
          </div>
        </div>

        <!-- Medical Records Section -->
        <div v-if="currentTab === 'medicalRecords'" class="section">
          <h2>Pending Medical Records</h2>
          <div v-if="isLoading.medicalRecords" class="loading-state">
            <div class="loader"></div>
            <p>Loading medical records...</p>
          </div>
          <div v-else-if="hasError.medicalRecords" class="error-state">
            <p>Failed to load medical records. Please try again.</p>
            <button @click="loadMedicalRecords()" class="btn-retry">
              Retry
            </button>
          </div>
          <div
            v-else-if="medicalRecords.items.length === 0"
            class="empty-state"
          >
            <p>No pending medical records found.</p>
          </div>
          <div v-else class="cards-grid">
            <div
              v-for="record in medicalRecords.items"
              :key="record.id"
              class="card"
            >
              <div class="card-header">
                <h3>Medical Record</h3>
                <span class="status pending">Pending</span>
              </div>
              <div class="card-content">
                <p><strong>Pet:</strong> {{ record.pet?.name }}</p>
                <p><strong>Owner:</strong> {{ record.pet?.owner?.username }}</p>
                <p>
                  <strong>Submitted:</strong>
                  {{ new Date(record.createdAt).toLocaleDateString() }}
                </p>
              </div>
              <div class="card-actions">
                <button
                  class="btn-approve"
                  @click="approveMedicalRecord(record.id)"
                >
                  Approve
                </button>
                <button
                  class="btn-reject"
                  @click="showRejectModal(record.id, 'medicalRecord')"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
          <div class="pagination">
            <button
              :disabled="medicalRecords.page <= 1"
              @click="loadMedicalRecords(medicalRecords.page - 1)"
            >
              Previous
            </button>
            <span
              >Page {{ medicalRecords.page }} of
              {{ medicalRecords.totalPages }}</span
            >
            <button
              :disabled="medicalRecords.page >= medicalRecords.totalPages"
              @click="loadMedicalRecords(medicalRecords.page + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Rejection Modal -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal">
          <h3>Reject {{ rejectType }}</h3>
          <div class="modal-content">
            <textarea
              v-model="rejectReason"
              placeholder="Enter rejection reason..."
              rows="4"
            ></textarea>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="closeModal">Cancel</button>
            <button class="btn-reject" @click="handleReject">
              Confirm Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useToast } from "vue-toastification";
import AdminNavigation from "../../components/layouts/AdminNavigation.vue";

const toast = useToast();

// Enhanced tabs configuration with icons
const tabs = [
  { id: "verifications", name: "Verifications", icon: "fas fa-user-check" },
  { id: "vetDocs", name: "Vet Documents", icon: "fas fa-file-medical" },
  {
    id: "medicalRecords",
    name: "Medical Records",
    icon: "fas fa-notes-medical",
  },
];
const currentTab = ref("verifications");

// Data states
const verifications = ref({ items: [], page: 1, totalPages: 1 });
const vetDocuments = ref({ items: [], page: 1, totalPages: 1 });
const medicalRecords = ref({ items: [], page: 1, totalPages: 1 });

// Modal states
const showModal = ref(false);
const rejectReason = ref("");
const rejectId = ref(null);
const rejectType = ref("");

// Add loading states
const isLoading = ref({
  verifications: false,
  vetDocs: false,
  medicalRecords: false,
});

// Add error states
const hasError = ref({
  verifications: false,
  vetDocs: false,
  medicalRecords: false,
});

// Base URL for API
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:6600";

// Load data functions
const loadVerifications = async (page = 1) => {
  isLoading.value.verifications = true;
  hasError.value.verifications = false;
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/verifications`,
      {
        params: { page, limit: 10 },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    verifications.value = {
      items: response.data.data || [],
      page: response.data.page || 1,
      totalPages: response.data.totalPages || 1,
    };
  } catch (error) {
    console.error("Error loading verifications:", error);
    hasError.value.verifications = true;
    toast.error(
      error.response?.data?.message || "Failed to load verifications"
    );
  } finally {
    isLoading.value.verifications = false;
  }
};

const loadVetDocuments = async (page = 1) => {
  isLoading.value.vetDocs = true;
  hasError.value.vetDocs = false;
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/vet-documents`,
      {
        params: { page, limit: 10 },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    vetDocuments.value = {
      items: response.data.data || [],
      page: response.data.page || 1,
      totalPages: response.data.totalPages || 1,
    };
  } catch (error) {
    console.error("Error loading vet documents:", error);
    hasError.value.vetDocs = true;
    toast.error(
      error.response?.data?.message || "Failed to load vet documents"
    );
  } finally {
    isLoading.value.vetDocs = false;
  }
};

const loadMedicalRecords = async (page = 1) => {
  isLoading.value.medicalRecords = true;
  hasError.value.medicalRecords = false;
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/medical-records`,
      {
        params: { page, limit: 10 },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    medicalRecords.value = {
      items: response.data.data || [],
      page: response.data.page || 1,
      totalPages: response.data.totalPages || 1,
    };
  } catch (error) {
    console.error("Error loading medical records:", error);
    hasError.value.medicalRecords = true;
    toast.error(
      error.response?.data?.message || "Failed to load medical records"
    );
  } finally {
    isLoading.value.medicalRecords = false;
  }
};

// Action handlers with updated endpoints
const approveVerification = async (id) => {
  try {
    await axios.put(
      `${API_BASE_URL}/api/admin/verifications/${id}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    toast.success("Verification approved");
    loadVerifications(verifications.value.page);
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to approve verification"
    );
  }
};

const approveVetDocument = async (id) => {
  try {
    await axios.put(
      `${API_BASE_URL}/api/admin/vet-documents/${id}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    toast.success("Vet document approved");
    loadVetDocuments(vetDocuments.value.page);
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to approve vet document"
    );
  }
};

const approveMedicalRecord = async (id) => {
  try {
    await axios.put(
      `${API_BASE_URL}/api/admin/medical-records/${id}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    toast.success("Medical record approved");
    loadMedicalRecords(medicalRecords.value.page);
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to approve medical record"
    );
  }
};

// Modal handlers
const showRejectModal = (id, type) => {
  rejectId.value = id;
  rejectType.value = type;
  rejectReason.value = "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  rejectId.value = null;
  rejectReason.value = "";
};

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    toast.error("Please provide a rejection reason");
    return;
  }

  try {
    const endpoints = {
      verification: `${API_BASE_URL}/api/admin/verifications/${rejectId.value}/reject`,
      vetDoc: `${API_BASE_URL}/api/admin/vet-documents/${rejectId.value}/reject`,
      medicalRecord: `${API_BASE_URL}/api/admin/medical-records/${rejectId.value}/reject`,
    };

    await axios.put(
      endpoints[rejectType.value],
      { reason: rejectReason.value },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    toast.success(`${rejectType.value} rejected`);

    if (rejectType.value === "verification")
      loadVerifications(verifications.value.page);
    else if (rejectType.value === "vetDoc")
      loadVetDocuments(vetDocuments.value.page);
    else loadMedicalRecords(medicalRecords.value.page);

    closeModal();
  } catch (error) {
    toast.error(
      error.response?.data?.message || `Failed to reject ${rejectType.value}`
    );
  }
};

// Initial load
onMounted(() => {
  loadVerifications();
  loadVetDocuments();
  loadMedicalRecords();
});
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f0f2f5;
  padding-top: 60px; /* Space for fixed navigation */
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem 2rem;
  margin-left: 250px; /* Match sidebar width */
}

.dashboard-header h1 {
  font-size: 1.75rem;
  color: #1a1a1a;
  margin: 0;
  font-weight: 600;
}

.subtitle {
  color: #666;
  margin: 0.5rem 0 0 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem 2rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.verification-icon {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
}

.document-icon {
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  color: white;
}

.record-icon {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 0.875rem;
  color: #666;
  margin: 0 0 0.25rem 0;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
  margin: 0.25rem 0 0 0;
}

.tabs {
  position: fixed;
  left: 0;
  top: 60px; /* Position below the admin navigation */
  bottom: 0;
  width: 250px;
  background: white;
  padding: 1.5rem 0;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 20;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  width: 100%;
  border: none;
  background: none;
  text-align: left;
  font-size: 0.875rem;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;
}

.tab-button i {
  font-size: 1.125rem;
  width: 24px;
  text-align: center;
}

.tab-button span {
  flex: 1;
}

.tab-button:hover {
  background: #f8f9fa;
  color: #1a1a1a;
}

.tab-button.active {
  background: #f0f2f5;
  color: #4f46e5;
  font-weight: 500;
  border-right: 3px solid #4f46e5;
}

.dashboard-content {
  flex: 1;
  margin-left: 250px; /* Match sidebar width */
  padding: 1.5rem 2rem;
}

.section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section h2 {
  padding: 1.5rem;
  margin: 0;
  border-bottom: 1px solid #eee;
  font-size: 1.25rem;
  color: #1a1a1a;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.card {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: #ddd;
}

.card-header {
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #1a1a1a;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status.pending {
  background: #fff7ed;
  color: #ea580c;
}

.card-content {
  padding: 1rem;
}

.card-content p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #666;
}

.card-content p strong {
  color: #1a1a1a;
  font-weight: 500;
}

.card-actions {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 0.75rem;
}

.btn-approve,
.btn-reject {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-approve {
  background: #f0fdf4;
  color: #16a34a;
}

.btn-approve:hover {
  background: #dcfce7;
}

.btn-reject {
  background: #fef2f2;
  color: #dc2626;
}

.btn-reject:hover {
  background: #fee2e2;
}

.pagination {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  border-top: 1px solid #eee;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #eee;
  background: white;
  border-radius: 6px;
  color: #666;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination button:not(:disabled):hover {
  background: #f8f9fa;
  border-color: #ddd;
  color: #1a1a1a;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  color: #1a1a1a;
}

.modal-content textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 6px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  font-size: 0.875rem;
}

.modal-content textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  border: 1px solid #eee;
  background: white;
  border-radius: 6px;
  color: #666;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f8f9fa;
  border-color: #ddd;
  color: #1a1a1a;
}

/* Loading, error, and empty states */
.loading-state,
.error-state,
.empty-state {
  padding: 3rem;
  text-align: center;
  color: #666;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid #eee;
  border-radius: 50%;
  border-top-color: #4f46e5;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry:hover {
  background: #4338ca;
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding-top: 110px; /* Space for fixed navigation + tabs */
  }

  .dashboard-header,
  .dashboard-content {
    margin-left: 0;
    padding: 1rem;
  }

  .tabs {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: auto;
    width: 100%;
    height: auto;
    padding: 0.5rem;
    flex-direction: row;
    overflow-x: auto;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    -webkit-overflow-scrolling: touch;
  }

  .tab-button {
    width: auto;
    min-width: max-content;
    white-space: nowrap;
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
  }

  .tab-button.active {
    border-right: none;
    border-bottom: 3px solid #4f46e5;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .card {
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 480px) {
  .admin-dashboard {
    padding-top: 100px;
  }

  .dashboard-header {
    padding: 0.75rem;
  }

  .dashboard-header h1 {
    font-size: 1.25rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }

  .tabs {
    padding: 0.25rem;
  }

  .tab-button {
    padding: 0.5rem;
    justify-content: center;
  }

  .tab-button i {
    margin: 0;
    font-size: 1.25rem;
  }

  .tab-button span {
    display: none;
  }

  .stat-card {
    padding: 0.75rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .card-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-approve,
  .btn-reject {
    width: 100%;
  }

  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }

  .pagination button {
    width: 100%;
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .tab-button {
    -webkit-tap-highlight-color: transparent;
  }

  .tab-button:active {
    background: #f0f2f5;
  }

  .card:active {
    transform: scale(0.98);
  }

  .btn-approve:active,
  .btn-reject:active {
    opacity: 0.8;
  }
}
</style>
