/* eslint-disable */
import { defineStore } from 'pinia'
import router from '../router/index'
import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from 'firebase/auth'
/* eslint-enable */

const useAuthStore = defineStore('auth', {
  state: () => ({
    name: '',
    isLoggedIn: false,
  }),
  actions: {
    signupEmail(email: string, password: string, name: string) {
      const auth = getAuth()
      createUserWithEmailAndPassword(auth, email, password)
        .then((result) => {
          const { user } = result
          updateProfile(user, {
            displayName: name,
          })
            .then(async () => {
              this.name = name
              await router.replace({
                name: 'Home',
              })
            })
            .catch((error) => {
              console.log(error.message)
            })
        })
        .catch((error) => {
          console.log(error.message)
        })
    },
    loginEmail(email: string, password: string) {
      const auth = getAuth()
      signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const { user } = userCredential
          this.setUser(user)
          await router.replace({
            name: 'Home',
          })
        })
        .catch((error) => {
          console.log(error.message)
        })
    },
    logout() {
      const auth = getAuth()
      signOut(auth)
        .then(async () => {
          this.$reset()
          await router.replace({
            name: 'Home',
          })
        })
        .catch((error) => {
          console.log(error.message)
        })
    },

    setUser(user: User) {
      this.name = user.displayName ?? ''
      this.isLoggedIn = true
    },
  },
})

export default useAuthStore
