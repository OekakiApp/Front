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
      console.log(
        api.post('/auth/jwt/create/?=', {
          email,
          password,
        }),
      )

      const response = await api.post('/auth/jwt/create/?=', {
        email,
        password,
      })
      localStorage.setItem('access', response.data.access_token)
      console.log(response.data)
      this.name = response.data.user.name
      this.isLoggedIn = true
    },
  },
})

export default useAccountStore
