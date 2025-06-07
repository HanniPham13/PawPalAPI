import { defineStore } from "pinia";
import axios from "axios";

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  bio?: string;
  profile?: {
    profilePictureUrl: string | null;
  };
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: localStorage.getItem("token"),
    user: JSON.parse(localStorage.getItem("user") || "null"),
    isLoading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isVerified: (state) => state.user?.isEmailVerified || false,
  },
  actions: {
    async register(userData: {
      email: string;
      username: string;
      password: string;
      firstName: string;
      lastName: string;
      address?: {
        address: string;
        city: string;
        state: string;
        zipCode: string;
      };
    }) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post("/api/register", userData);

        if (response.data.success) {
          return {
            success: true,
            message: response.data.message,
            email: userData.email,
          };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || "Registration failed";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async verifyEmail(email: string, code: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post("/api/verify-email", { email, code });

        if (response.data.success) {
          return { success: true, message: response.data.message };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (error: any) {
        this.error =
          error.response?.data?.message || "Email verification failed";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async resendVerificationEmail(email: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post("/api/resend-verification", {
          email,
        });

        if (response.data.success) {
          return { success: true, message: response.data.message };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (error: any) {
        this.error =
          error.response?.data?.message ||
          "Failed to resend verification email";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async login(email: string, password: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post("/api/login", { email, password });

        if (response.data.success) {
          this.token = response.data.token;
          this.user = response.data.user;

          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));

          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${response.data.token}`;

          return { success: true, message: response.data.message };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || "Login failed";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async requestPasswordReset(email: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post("/api/forgot-password", { email });

        if (response.data.success) {
          return { success: true, message: response.data.message };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (error: any) {
        this.error =
          error.response?.data?.message || "Failed to request password reset";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async resetPassword(email: string, token: string, newPassword: string) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.post("/api/reset-password", {
          email,
          token,
          newPassword,
        });

        if (response.data.success) {
          return { success: true, message: response.data.message };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (error: any) {
        this.error =
          error.response?.data?.message || "Failed to reset password";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUserProfile() {
      this.isLoading = true;
      this.error = null;
      try {
        // First set the auth header if we have a token
        if (this.token) {
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${this.token}`;
        } else {
          console.error("No auth token available for profile fetch");
          return { success: false, message: "Authentication required" };
        }

        console.log("Fetching profile from API: /api/user/profile");
        const response = await axios.get("/api/user/profile");
        console.log("Profile API response:", response.data);

        if (response.data.success) {
          // Update user data with the fresh profile data
          const userData = response.data.data;

          // Make sure we have a complete user object with all expected fields
          if (!userData) {
            console.error("Invalid user data in response");
            return { success: false, message: "Invalid user data received" };
          }

          // Store the complete user object
          this.user = userData;

          // Ensure we persist the complete user data to localStorage
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("token", this.token as string);

          return { success: true, data: userData };
        } else {
          this.error = response.data.message;
          console.error("API error fetching profile:", response.data.message);
          return { success: false, message: response.data.message };
        }
      } catch (error: any) {
        console.error("Exception in fetchUserProfile:", error);
        console.error("Error response:", error.response?.data);
        this.error =
          error.response?.data?.message || "Failed to fetch user profile";
        return { success: false, message: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Remove the Authorization header
      delete axios.defaults.headers.common["Authorization"];
    },
  },
});
