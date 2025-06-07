import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/auth/LoginView.vue"),
      meta: { guest: true },
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/admin/AdminView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/vet",
      name: "vet",
      component: () => import("../views/VetView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/auth/RegisterView.vue"),
      meta: { guest: true },
    },
    {
      path: "/verify-email",
      name: "verify-email",
      component: () => import("../views/auth/VerifyEmailView.vue"),
      meta: { guest: true },
    },
    {
      path: "/forgot-password",
      name: "forgot-password",
      component: () => import("../views/auth/ForgotPasswordView.vue"),
      meta: { guest: true },
    },
    {
      path: "/reset-password",
      name: "reset-password",
      component: () => import("../views/auth/ResetPasswordView.vue"),
      meta: { guest: true },
    },
    {
      path: "/feed",
      name: "feed",
      component: () => import("../views/FeedView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/saved",
      name: "saved-posts",
      component: () => import("../views/SavedPostsView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/followers",
      name: "followers",
      component: () => import("../views/FollowersView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/following",
      name: "following",
      component: () => import("../views/FollowingView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/messages",
      name: "messages",
      component: () => import("../views/MessagesView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/chat/:id",
      name: "chat",
      component: () => import("../views/ChatView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/ProfileView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/user/:userId",
      name: "user-profile",
      component: () => import("../views/UserProfileView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/create-adoption-post",
      name: "create-adoption-post",
      component: () => import("../views/adoption/CreateAdoptionPostView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/adoption-feed",
      name: "adoption-feed",
      component: () => import("../views/adoption/AdoptionFeedView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/my-pets",
      name: "my-pets",
      component: () => import("../views/pets/MyPetsView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/pet/:id/edit",
      name: "edit-pet",
      component: () => import("../views/pets/EditPetProfileView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/adoption-post/:id",
      name: "adoption-post-details",
      component: () => import("../views/adoption/AdoptionPostDetailsView.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: "login" });
    } else {
      // Check for admin routes
      if (to.path.startsWith("/admin") && user?.role !== "ADMIN") {
        next({ name: "feed" });
      }
      // Check for vet routes
      else if (to.path.startsWith("/vet") && user?.role !== "VET") {
        next({ name: "feed" });
      } else {
        next();
      }
    }
  } else if (to.matched.some((record) => record.meta.guest)) {
    if (isAuthenticated) {
      // Redirect based on role
      if (user?.role === "ADMIN") {
        next({ name: "admin" });
      } else if (user?.role === "VET") {
        next({ name: "vet" });
      } else {
        next({ name: "feed" });
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
