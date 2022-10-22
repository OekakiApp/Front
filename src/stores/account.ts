import { defineStore } from 'pinia'
import api from '../services/api'

const useAccountStore = defineStore({
  id: 'account',
  state: () => ({
    name: '',
    isLoggedIn: false,
    isAutoLoginOnce: false,
  }),
  actions: {
    async login(email: string, password: string): Promise<void> {
      const LoginResponse = await api.post('/auth/jwt/create/?=', {
        email,
        password,
      })
      // 認証用トークンをlocalStorageに保存
      localStorage.setItem('access', LoginResponse.data.access)
      localStorage.setItem('refresh', LoginResponse.data.refresh)

      await this.renew()
    },

    logout(): void {
      // 認証用トークンの削除
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')

      // reset
      this.$reset()
      this.isAutoLoginOnce = true
    },

    // ユーザー情報更新
    async renew() {
      const response = await api.get('/auth/users/me/')
      if (response === undefined) return

      this.name = response.data.name
      this.isLoggedIn = true
    },
  },
})

export default useAccountStore
