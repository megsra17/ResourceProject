import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import LoginView from '../views/Login.vue'
import { useMenuStore } from '@/stores/useMenuStore' // Import Pinia store

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }, // 🔒 Protected route
    },

    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
  ],
})

// 🔒 Navigation Guard (Redirect Unauthenticated Users)
router.beforeEach((to, from, next) => {
  const menuStore = useMenuStore()

  if (to.meta.requiresAuth && !menuStore.isAuthenticated) {
    next('/login') // Redirect to login if user is not authenticated
  } else {
    next() // Allow navigation
  }
})

export default router
