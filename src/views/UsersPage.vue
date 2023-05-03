<script setup lang="ts">
import { ref, reactive, watch, onMounted, type Ref } from 'vue'
import useAuthStore from '@/stores/auth'
import useStoreCanvas from '@/stores/canvas'
import { useRoute } from 'vue-router'
import { db } from '@/firebase/index'
import {
  query,
  doc,
  getDocs,
  getDoc,
  where,
  collection,
  setDoc,
  Timestamp,
} from 'firebase/firestore'
import Icon from '@/assets/user_icon.png'
import type { User } from '@/firebase/types/index'
import type { ShareCanvases, Heart } from '@/firebase/types/index'

const route = useRoute()
const authStore = useAuthStore()
const authCanvas = useStoreCanvas()

const user = ref<User | null>(null)
const canvases = ref({} as Record<string, ShareCanvases>)
const likeMap: Ref<Record<string, Heart>> = ref({})
const authIsReady = ref(false)

const modalImage = ref('')
const modalWidth =
  window.innerWidth <= 400
    ? ref(window.innerWidth * 0.9)
    : ref(window.innerWidth * 0.7)
const modalHeight = ref((modalWidth.value * 9) / 16)

const modalStyle = reactive({
  width: `${modalWidth.value}px`,
  height: `${modalHeight.value}px`,
})

onMounted(() => {
  getHeartMap()
  setProfile()
})

watch(route, () => {
  initializeProfile()
  setProfile()
})

const getHeartMap = async () => {
  await getDoc(doc(db, 'hearts', authStore.uid))
    .then((heartDocSnap) => {
      if (heartDocSnap.exists()) {
        likeMap.value = heartDocSnap.data()
      }
    })
    .catch((error) => {
      console.log(error)
    })
}

const setProfile = () => {
  const otherUserUID = String(route.params.user_id)
  if (authStore.uid !== otherUserUID) {
    getDoc(doc(db, 'users', otherUserUID))
      .then(async (userDocSnap) => {
        if (userDocSnap.exists()) {
          user.value = {
            name: userDocSnap.data().name,
            icon:
              userDocSnap.data().icon === '' ? Icon : userDocSnap.data().icon,
            profile: userDocSnap.data().profile,
          }
          authIsReady.value = true
          setCanvases(otherUserUID)
        } else {
          authIsReady.value = true
          console.log('プロフィール情報が見つかりません')
        }
      })
      .catch((error) => {
        console.log('プロフィール情報の取得に失敗しました：', error)
      })
  } else {
    user.value = {
      name: authStore.name,
      icon: authStore.icon,
      profile: authStore.profile,
    }
    authIsReady.value = true
    canvasToShareCanvases()
  }
}

const canvasToShareCanvases = () => {
  Object.keys(authCanvas.canvases).forEach((key) => {
    const canvas = authCanvas.canvases[key]
    const shareCanvas: ShareCanvases = {
      title: canvas.name,
      id: key,
      uid: canvas.uid,
      image: canvas.image,
      createdAt: canvas.createdAt,
      updatedAt: canvas.updatedAt,
      name: canvas.name,
      avator: '',
      isLike: false,
    }
    canvases.value[key] = shareCanvas
  })
}

const setCanvases = async (otherUserUID: string) => {
  const canvasQuery = query(
    collection(db, 'canvas'),
    where('uid', '==', otherUserUID),
    where('isShare', '==', true),
  )
  await getDocs(canvasQuery)
    .then((querySnapshot) => {
      querySnapshot.forEach((document) => {
        const canvasID = document.id
        const canvas: ShareCanvases = {
          title: document.data().name,
          id: canvasID,
          uid: document.data().uid,
          image: document.data().image,
          createdAt: document.data().createdAt,
          updatedAt: document.data().updatedAt,
          name: document.data().name,
          avator: '',
          isLike:
            likeMap.value[canvasID] !== undefined
              ? likeMap.value[canvasID].isLike
              : false,
        }
        canvases.value[canvasID] = canvas
      })
    })
    .catch((error) => {
      console.log(error)
    })
}

const initializeProfile = () => {
  user.value = null
  canvases.value = {}
  authIsReady.value = false
}

const userCol = () => {
  if (authStore.uid === route.params.user_id) {
    return 'col-span-12 sm:col-span-9 sm:ml-8'
  }
  return 'sm:mx-8'
}

const likeColor = (isLike: boolean) => (isLike ? 'fill: red' : 'fill: #71767B')

const clickLike = async (galleryId: string) => {
  const gallery = canvases.value[galleryId]
  if (gallery !== undefined) {
    gallery.isLike = !gallery?.isLike
    canvases.value[galleryId].isLike = gallery.isLike
    likeMap.value[galleryId] = {
      isLike: gallery.isLike,
      addedAt: Timestamp.now(),
    }
    await setDoc(doc(db, 'hearts', authStore.uid), likeMap.value)
  }
}

const resizeModal = (image: string) => {
  modalWidth.value =
    window.innerWidth <= 400 ? window.innerWidth * 0.9 : window.innerWidth * 0.7
  modalHeight.value = (modalWidth.value * 9) / 16
  modalStyle.width = `${modalWidth.value}px`
  modalStyle.height = `${modalHeight.value}px`
  modalImage.value = image
}
</script>

<template lang="pug">
div(class="grid grid-cols-12 mt-4 sm:mt-8")
  //- left
  div(v-if="authStore.uid === route.params.user_id" class="col-span-3 lg:col-span-2 sm:block hidden")
    div(class="border rounded-lg p-4")
      ul(class="text-midnightBlue")
        li(class="border-b pb-2")
          router-link(:to="{name: 'Users', params: { user_id: authStore.uid }}" class="text-dustyOrange block") ユーザー情報
        //- li(class="border-b py-2")
        //-   a(href="#" class="block") お気に入り
        //- li(class="border-b py-2")
        //-   a(href="#" class="block") 設定
        li(class="pt-2")
          button(class="block" @click="authStore.logout()") ログアウト
  //- right
  div(:class="userCol()" class="col-span-12")
    //- top
    div(v-if="authIsReady && user" class="relative sm:static sm:grid sm:grid-cols-12 pb-4 border-b")
      div(class="col-span-10 sm:flex")
        div
          img(:src="user.icon" class="avatar ring-2 ring-gray-700 ")
        div(class="flex flex-col justify-around text-midnightBlue mt-4 sm:mt-0 sm:ml-4")
          p(class="text-xl lg:text-2xl font-bold") {{ user.name }}
          p(class="text-xs sm:text-sm  whitespace-pre-wrap") {{ user.profile }}
      div(v-if="authStore.uid === route.params.user_id" class="col-span-2 absolute sm:static top-4 right-0 mx-auto")
        router-link(to="/profile/settings") 
          button(class="focus:outline-none text-white bg-seaPink hover:bg-red-400 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-3 py-1") 編集
    div(v-else-if="authIsReady && user === null")
      h1(class="text-center text-xl font-bold mt-4") このアカウントは存在しません
    
    //- bottom
    div(class="my-8 grid gap-4 xl:grid-cols-3 md:grid-cols-2")      
      div(v-for="(canvas, index) of canvases" :key="index" class="picture m-auto")
        
        //- MyAccount
        div(v-if="authStore.uid === route.params.user_id")
          router-link(:to="{name: 'Create', params: { canvas_id: index }}")
            div(class="flex items-center")  
              img(v-if='canvas.image' :src="canvas.image" class="bg-gray-200 rounded-lg border border-gray-500" )
              img(v-else class="bg-gray-200 rounded-lg border border-gray-500" style="width: 320px; height: 180px")
            div(class="flex mt-2")  
              div(class="text-midnightBlue pl-2") {{ canvas.name }}
        
        //- OtherAccount
        div(v-else)
          div(class="flex items-center relative")
            label(for="modal" style="width: 320px; height: 180px" @click="resizeModal(canvas.image)")
              img(v-if='canvas.image' :src="canvas.image" class="bg-gray-200 rounded-lg border border-gray-500")
              img(v-else class="bg-gray-200 rounded-lg border border-gray-500" style="width: 320px; height: 180px")
            svg(class="heart absolute cursor-pointer" viewBox="0 0 32 29.6" :style="likeColor(canvas.isLike)" style="right: 10px; bottom: 10px" @click="clickLike(canvas.id)")
              path(d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z")
          div(class="flex mt-2")  
            div(class="text-midnightBlue pl-2") {{ canvas.name }}
            
input(id="modal" type="checkbox" class="modal-toggle")
label(for="modal" class="modal cursor-pointer")
  img(v-if='modalImage' :src="modalImage" class="rounded-lg border border-gray-500 relative" :style="modalStyle")
  img(v-else class="bg-gray-200 rounded-lg border border-gray-500" :style="modalStyle")
</template>

<style scoped>
.avatar {
  vertical-align: middle;
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.heart {
  width: 20px;
}
</style>
