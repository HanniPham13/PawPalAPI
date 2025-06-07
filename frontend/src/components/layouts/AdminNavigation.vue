<script setup lang="ts">
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
  authStore.logout();
  router.push("/login");
};
</script>

<template>
  <nav class="admin-nav">
    <div class="nav-container">
      <div class="nav-inner">
        <div class="nav-brand">
          <router-link to="/admin" class="brand-link">
            <span class="brand-gradient">PawPal Admin</span>
          </router-link>
        </div>
        <div class="nav-actions">
          <div class="admin-info">
            <i class="fas fa-user-shield"></i>
            <span>Administrator</span>
          </div>
          <button @click="logout" class="signout-btn">
            <i class="fas fa-sign-out-alt"></i>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.admin-nav {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-container {
  padding: 0 1.5rem;
  max-width: 100%;
}

.nav-inner {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  text-decoration: none;
}

.brand-gradient {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1a1a1a;
  font-weight: 500;
}

.admin-info i {
  color: #4f46e5;
}

.signout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.signout-btn:hover {
  background: #fef2f2;
  border-color: #dc2626;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }

  .nav-inner {
    height: 50px;
  }

  .brand-gradient {
    font-size: 1.25rem;
  }

  .nav-actions {
    gap: 1rem;
  }

  .signout-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 0.75rem;
  }

  .brand-gradient {
    font-size: 1.125rem;
  }

  .nav-actions {
    gap: 0.5rem;
  }

  .admin-info {
    font-size: 0.875rem;
  }

  .signout-btn {
    padding: 0.375rem;
  }

  .signout-btn span {
    display: none;
  }
}
</style>
