import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomePage.vue'
import CreatePage from '../views/CreatePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
    },
    {
      path: '/create',
      name: 'Create',
      component: CreatePage,
    },
  ],
})

export default router
