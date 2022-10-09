import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomePage.vue'
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
