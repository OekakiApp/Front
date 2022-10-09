import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomePage.vue'
import LoginView from '../views/LoginPage.vue'
import SignUpView from '../views/SignUpPage.vue'
import CreatePage from '../views/CreatePage.vue'
import UserView from '../views/UsersPage.vue'
import profileSettingsView from '../views/ProfileSettingsPage.vue'

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
    {
      path: '/create',
      name: 'Create',
      component: CreatePage,
    },
    {
      path: '/users',
      name: 'Users',
      component: UserView,
    },
    {
      path: '/profile/settings',
      name: 'ProfileSettings',
      component: profileSettingsView,
    },
  ],
})

export default router
