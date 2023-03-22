/* eslint-disable */
// import/no-cycle
import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
} from 'vue-router'
import useAuthStore from '@/stores/auth'
import TopView from '@/views/TopPage.vue'
import LoginView from '@/views/LoginPage.vue'
import SignUpView from '@/views/SignUpPage.vue'
import CreatePage from '@/views/CreatePage.vue'
import UserView from '@/views/UsersPage.vue'
import profileSettingsView from '@/views/ProfileSettingsPage.vue'
import WorkListView from '@/views/WorkList.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
/* eslint-enable */

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: TopView,
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
      path: '/create/:canvas_id',
      name: 'Create',
      component: CreatePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/works',
      name: 'Works',
      component: WorkListView,
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
  const { isLoggedIn } = useAuthStore()
  if (!isLoggedIn) {
    await autoLogin(to)
  }
})

async function autoLogin(to: RouteLocationNormalized) {
  const auth = getAuth()
  const authStore = useAuthStore()
  const { isLoggedIn } = authStore
  /* eslint-disable */
  return new Promise<void>((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user != null) {
        await authStore.setUser(user)
        await authStore.getCanvases()
        if (to.name === 'Home') {
          await forceToWorksPage()
        }
        console.log('ログイン成功')
      } else {
        console.log('ログイン失敗')
        if (!isLoggedIn && to.meta.requiresAuth === true) {
          // ユーザー情報を再取得
          await forceToLoginPage()
        }
      }
      resolve()
    })
  })
  /* eslint-enable */
}

export async function forceToHomePage() {
  await router.replace({
    name: 'Home',
  })
}

export async function forceToWorksPage() {
  await router.replace({
    name: 'Works',
  })
}

async function forceToLoginPage() {
  await router.replace({
    name: 'Login',
  })
}

export default router
