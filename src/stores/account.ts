import { defineStore } from 'pinia'
import api from '../services/api'

const useAccountStore = defineStore({
  id: 'account',
  state: () => ({
    name: '',
    isLoggedIn: false,
  }),
  actions: {
    async login(email: string, password: string) {
      const LoginResponse = await api.post('/auth/jwt/create/?=', {
        email: email,
        password: password,
      })
      // 認証用トークンをlocalStorageに保存
      localStorage.setItem('access', LoginResponse.data.access)

      const getUserInfo = await api.get('/auth/users/me/')
      // ストアのユーザー情報を更新
      this.name = getUserInfo.data.name
      this.isLoggedIn = true
    },
  },
})

export default useAccountStore
