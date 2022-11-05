/* eslint-disable */
// import/no-cycle
import { defineStore } from 'pinia'
import router from '@/router/index'
import { db } from '@/firebase/index'
import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from 'firebase/auth'
import {
  query,
  getDocs,
  where,
  collection,
  DocumentData,
} from 'firebase/firestore'
import Icon from '../assets/user_icon.png'
/* eslint-enable */

const useAuthStore = defineStore('auth', {
  state: () => ({
    uid: '',
    name: '',
    icon: Icon,
    profile: '',
    isLoggedIn: false,
    canvases: {} as DocumentData, // eslint-disable-line
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
          await this.setUser(user)
          await this.getCanvases()
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

    async setUser(user: User) {
      this.uid = user.uid
      this.name = user.displayName ?? ''
      this.icon = user.photoURL ?? Icon
      this.isLoggedIn = true

      // get profile
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', user.uid),
      )

      await getDocs(userQuery)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            this.profile = doc.data().profile
            localStorage.setItem('usersId', user.uid)
          })
        })
        .catch((error) => {
          console.log(error)
        })
    },

    async getCanvases() {
      const usersId: string = localStorage.getItem('usersId') ?? ''
      const canvasQuery = query(
        collection(db, 'canvas'),
        where('uid', '==', usersId),
      )

      await getDocs(canvasQuery)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let canvasID = doc.id
            this.canvases[canvasID] = doc.data()
          })
        })
        .catch((error) => {
          console.log(error)
        })
    },
  },
})

async function forceToHomePage() {
  await router.replace({
    name: 'Home',
  })
}

export default useAuthStore
