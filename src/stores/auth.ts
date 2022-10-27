/* eslint-disable */
// import/no-cycle
import { defineStore } from 'pinia'
import router from '@/router/index'
import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from 'firebase/auth'
import Icon from '../assets/user_icon.png'
/* eslint-enable */

const useAuthStore = defineStore('auth', {
  state: () => ({
    name: '',
    icon: Icon,
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
              await forceToHomePage()
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
          await forceToHomePage()
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
          await forceToHomePage()
        })
        .catch((error) => {
          console.log(error.message)
        })
    },

    setUser(user: User) {
      this.name = user.displayName ?? ''
      this.icon = user.photoURL ?? Icon
      this.isLoggedIn = true
    },
  },
})

async function forceToHomePage() {
  await router.replace({
    name: 'Home',
  })
}

export default useAuthStore
