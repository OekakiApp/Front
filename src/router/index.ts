import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomePage.vue'
import LoginView from '../views/LoginPage.vue'
import SignUpView from '../views/SignUpPage.vue'

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
      component: LoginView,
    },
    {
      path: '/sign_up',
      name: 'SignUp',
      component: SignUpView,
    },
  ],
})

export default router
