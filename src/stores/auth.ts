/* eslint-disable import/no-cycle, @typescript-eslint/consistent-type-assertions */
import { defineStore, getActivePinia } from 'pinia'
import { forceToHomePage } from '@/router/index'
import { db } from '@/firebase/index'
import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
  AuthError,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore'
import Icon from '@/assets/user_icon.png'
import type { Like, ShareCanvas } from '@/firebase/types/index'

const useAuthStore = defineStore('auth', {
  state: () => ({
    uid: '',
    name: '',
    icon: Icon,
    profile: '',
    isLoggedIn: false,
    isAuthError: false,
    authErrorMessage: '' as string | undefined,
    likeMap: {} as Record<string, Like>,
    shareCanvases: {} as Record<string, ShareCanvas>,
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
              // database usersを作成
              await setDoc(doc(db, 'users', user.uid), {
                profile: 'よろしくお願いします。',
                name,
                icon: '',
                uid: user.uid,
              })
            })
            .catch((error) => {
              console.log(error.message)
            })
        })
        .catch((error) => {
          this.authError(error)
        })
    },
    loginEmail(email: string, password: string) {
      const auth = getAuth()
      signInWithEmailAndPassword(auth, email, password).catch((error) => {
        this.authError(error)
      })
    },
    logout() {
      const auth = getAuth()
      signOut(auth)
        .then(async () => {
          //  piniaのstoreを全て削除
          const activePinia = getActivePinia()
          if (activePinia != null) {
            Object.entries(activePinia.state.value).forEach(
              ([storeName, state]) => {
                const storeDefinition = defineStore(storeName, state)
                const store = storeDefinition(activePinia)
                store.$reset()
              },
            )
          }
          await forceToHomePage()
        })
        .catch((error) => {
          console.log(error.message)
        })
    },

    authError(error: AuthError) {
      const { code } = error
      this.isAuthError = true
      this.authErrorMessage =
        errorMap.get(code) !== undefined
          ? errorMap.get(code)
          : '認証に失敗しました。しばらく時間をおいて再度お試しください'
    },

    async setUser(user: User) {
      this.isLoggedIn = true
      this.uid = user.uid
      this.name = user.displayName ?? ''
      this.icon = user.photoURL ?? Icon
      // get profile
      const userDocRef = doc(db, 'users', this.uid)
      const userDocSnap = await getDoc(userDocRef)
      if (userDocSnap.exists()) {
        this.profile = userDocSnap.data().profile
        // usersDB追加更新
        if (userDocSnap.data().name === undefined) {
          await updateDoc(userDocRef, {
            name: this.name,
            icon: this.icon,
          })
        }
      }
    },

    async setLikeMap() {
      await getDoc(doc(db, 'likes', this.uid))
        .then((likeDocSnap) => {
          if (likeDocSnap.exists()) {
            this.likeMap = likeDocSnap.data()
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },

    async clickLike(galleryId: string) {
      const shareCanvas = this.shareCanvases[galleryId]
      if (shareCanvas !== undefined) {
        shareCanvas.isLike = !shareCanvas?.isLike
        this.shareCanvases[galleryId].isLike = shareCanvas.isLike
        this.likeMap[galleryId] = {
          isLike: shareCanvas.isLike,
          addedAt: Timestamp.now(),
        }
        await setDoc(doc(db, 'likes', this.uid), this.likeMap)
      }
    },
  },
})

const errorMap = new Map([
  // 新規登録
  ['auth/email-already-in-use', 'このメールアドレスは既に使用されています'],
  ['auth/invalid-email', 'メールアドレスの形式が正しくありません'],
  ['auth/weak-password', 'パスワードは6文字以上 入力してください'],
  // ログイン
  ['auth/user-not-found', 'メールアドレスまたはパスワードが正しくありません'],
  ['auth/wrong-password', '正しいパスワードを入力してください'],
  ['auth/user-disabled', 'サービスの利用が停止されています'],
  [
    'auth/too-many-requests',
    'パスワードを忘れましたか？\nパスワードリセットは現在利用できません',
  ],
])

export default useAuthStore
