/* eslint-disable */
import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
} from 'vue-router'
import useAuthStore from '../stores/auth'
import HomeView from '@/views/HomePage.vue'
import LoginView from '@/views/LoginPage.vue'
import SignUpView from '@/views/SignUpPage.vue'
import CreatePage from '@/views/CreatePage.vue'
import UserView from '@/views/UsersPage.vue'
import profileSettingsView from '@/views/ProfileSettingsPage.vue'
/* eslint-enable */

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
      meta: { requiresAuth: false },
    },
    {
      path: '/sign_up',
      name: 'SignUp',
      component: SignUpView,
      meta: { requiresAuth: false },
    },
    {
      path: '/create',
      name: 'Create',
      component: CreatePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'Users',
      component: UserView,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile/settings',
      name: 'ProfileSettings',
      component: profileSettingsView,
      meta: { requiresAuth: true },
    },
    {
      // 定義外のパスをリダイレクト
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to: RouteLocationNormalized) => {
  const authStore = useAuthStore()
  const { isLoggedIn } = authStore
  // ログイン状態、且つ未ログイン画面に遷移しようとした場合
  if (isLoggedIn && to.meta.requiresAuth === false) {
    await forceToHomePage()
  }
  // 未ログイン状態、且つログインが必要な画面に遷移しようとした場合
  else if (!isLoggedIn && to.meta.requiresAuth === true) {
    // ユーザー情報を再取得
    await forceToLoginPage()
  }
})

async function forceToHomePage() {
  await router.replace({
    name: 'Home',
  })
}

async function forceToLoginPage() {
  await router.replace({
    name: 'Login',
  })
}

export default router
