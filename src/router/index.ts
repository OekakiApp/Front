import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
} from 'vue-router'
import useAccountStore from '../stores/account'
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
    },
    {
      // 定義外のパスをリダイレクト
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to: RouteLocationNormalized) => {
  const accountStore = useAccountStore()
  const { isLoggedIn } = accountStore
  // ログイン状態、且つ未ログイン画面に遷移しようとした場合
  if (isLoggedIn && to.meta.requiresAuth === false) {
    await forceToHomePage()
  }
  // 未ログイン状態、且つログインが必要な画面に遷移しようとした場合
  else if (!isLoggedIn && to.meta.requiresAuth === true) {
    // ユーザー情報を再取得
    accountStore.renew().catch(async () => {
      // 再取得できなければログイン画面に強制送還
      await forceToLoginPage(to)
    })
  } else if (!isLoggedIn) {
    await accountStore.renew()
  }
})

async function forceToHomePage() {
  await router.replace({
    name: 'Home',
  })
}

async function forceToLoginPage(to: RouteLocationNormalized) {
  await router.replace({
    name: 'Login',
    // 遷移しようとしたURLをクエリ文字列として付与
    query: { next: to.fullPath },
  })
}

export default router
