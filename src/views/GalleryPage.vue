<script setup lang="ts">
import { ref, reactive, onMounted, type Ref } from 'vue'
import useAuthStore from '@/stores/auth'
import { db } from '@/firebase/index'
import {
  query,
  where,
  collection,
  getDocs,
  getDoc,
  doc,
  Timestamp,
  setDoc,
} from 'firebase/firestore'
import Icon from '@/assets/user_icon.png'

interface shareCanvases {
  title: string
  id: string
  uid: string
  image: string
  updatedAt: Timestamp
  name: string
  avator: string
  isLike: boolean
}

interface galleryUser {
  name: string
  icon: string
}

interface heart {
  isLike: boolean
  addedAt: Timestamp
}

const authStore = useAuthStore()

const galleries = ref(new Map<string, shareCanvases>())

const likeMap: Ref<Record<string, heart>> = ref({})

const modalImage = ref('')

onMounted(() => {
  setShareCanvases()
})

const modalWidth =
  window.innerWidth <= 400
    ? ref(window.innerWidth * 0.9)
    : ref(window.innerWidth * 0.7)
const modalHeight = ref((modalWidth.value * 9) / 16)

const modalStyle = reactive({
  width: `${modalWidth.value}px`,
  height: `${modalHeight.value}px`,
})

// ユーザーのハートMAPを取得する
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

// shareしているcanvasのユーザーを取得
const getShareUser = async (otherUserUID: string): Promise<galleryUser> => {
  let user: galleryUser = { name: '', icon: '' }
  await getDoc(doc(db, 'users', otherUserUID))
    .then(async (userDocSnap) => {
      if (userDocSnap.exists()) {
        user = {
          name: userDocSnap.data().name,
          icon: userDocSnap.data().icon === '' ? Icon : userDocSnap.data().icon,
        }
      } else {
        console.log('プロフィール情報が見つかりません')
      }
    })
    .catch((error) => {
      console.log('プロフィール情報の取得に失敗しました：', error)
    })
  return user
}

const setShareCanvases = async () => {
  getHeartMap()

  const canvasQuery = query(
    collection(db, 'canvas'),
    where('uid', '!=', authStore.uid),
    where('isShare', '==', true),
  )
  await getDocs(canvasQuery)
    .then((querySnapshot) => {
      querySnapshot.forEach(async (document) => {
        const canvasID = document.id
        const otherUserUID = document.data().uid
        // shareしているcanvasのユーザーを取得
        const user: galleryUser = await getShareUser(otherUserUID)

        const canvas: shareCanvases = {
          title: document.data().name,
          id: canvasID,
          uid: document.data().uid,
          image: document.data().image,
          updatedAt: document.data().updatedAt,
          name: user.name,
          avator: user.icon,
          isLike:
            likeMap.value[canvasID] !== undefined
              ? likeMap.value[canvasID].isLike
              : false,
        }
        galleries.value.set(canvasID, canvas)
      })
    })
    .catch((error) => {
      console.log(error)
    })
}

const likeColor = (isLike: boolean) => (isLike ? 'fill: red' : 'fill: #71767B')

const clickLike = async (galleryId: string) => {
  const gallery = galleries.value.get(galleryId)
  if (gallery !== undefined) {
    gallery.isLike = !gallery?.isLike
    galleries.value.set(galleryId, gallery)
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
div(class="my-8 grid gap-4 xl:grid-cols-3 md:grid-cols-2")
  div(v-for="[key, gallery] in Array.from(galleries)" :key="key" class="picture m-auto")
    div(class="flex items-center relative")
      label(for="modal" style="width: 320px; height: 180px" @click="resizeModal(gallery.image)")
        img(:src="gallery.image"  class="rounded-lg border border-gray-500")
      svg(class="heart absolute cursor-pointer" viewBox="0 0 32 29.6" :style="likeColor(gallery.isLike)" style="right: 10px; bottom: 10px" @click="clickLike(gallery.id)")
        path(d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z")
    div(class="flex flex-col mt-1 ml-2")
      div(class="text-midnightBlue") {{ gallery.title }}
      router-link(:to="{name: 'Users', params: { user_id: gallery.uid }}" class="flex items-center mt-1") 
        img(:src="gallery.avator" class="tiny-avatar ring-2 bg-gray-200 ring-gray-700 ")
        div(class="text-midnightBlue text-sm pl-2") {{ gallery.name }}

input(id="modal" type="checkbox" class="modal-toggle")
label(for="modal" class="modal cursor-pointer")
  img(:src="modalImage" class="rounded-lg border border-gray-500 relative" :style="modalStyle")

        
</template>

<style scoped>
.tiny-avatar {
  vertical-align: middle;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.heart {
  width: 20px;
}
</style>
