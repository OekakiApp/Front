import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'Login',
      component: import('../views/LoginPage.vue'),
    },
    {
      path: '/sign_up',
      name: 'SignUp',
      component: import('../views/SignUpPage.vue'),
    },
  ],
})

export default router
