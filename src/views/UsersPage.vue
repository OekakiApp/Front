<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import useAuthStore from '@/stores/auth'
import { useRoute } from 'vue-router'
import { db } from '@/firebase/index'
import {
  query,
  doc,
  getDocs,
  getDoc,
  where,
  collection,
} from 'firebase/firestore'
import Icon from '../assets/user_icon.png'

const route = useRoute()
const authStore = useAuthStore()

type Canvases = typeof authStore.canvases

const name = ref('')
const icon = ref('')
const profile = ref('')
const canvases: Canvases = ref({})
const isValidUser = ref()

onMounted(() => {
  setProfile()
})

watch(route, () => {
  initializeProfile()
  setProfile()
})

const setProfile = () => {
  const otherUserUID = String(route.params.user_id)
  if (authStore.uid !== otherUserUID) {
    getDoc(doc(db, 'users', otherUserUID))
      .then((userDocSnap) => {
        if (userDocSnap.exists()) {
          isValidUser.value = true
          name.value = userDocSnap.data().name
          icon.value =
            userDocSnap.data().icon === '' ? Icon : userDocSnap.data().icon
          profile.value = userDocSnap.data().profile
          // canvas取得
          setCanvases(otherUserUID)
        } else {
          isValidUser.value = false
          console.log('プロフィール情報が見つかりません')
        }
      })
      .catch((error) => {
        console.log('プロフィール情報の取得に失敗しました：', error)
      })
  } else {
    isValidUser.value = true
    icon.value = authStore.icon
    profile.value = authStore.profile
    canvases.value = authStore.canvases
  }
}

const setCanvases = (otherUserUID: string) => {
  const canvasQuery = query(
    collection(db, 'canvas'),
    where('uid', '==', otherUserUID),
    where('isShare', '==', true),
  )
  getDocs(canvasQuery)
    .then((querySnapshot) => {
      querySnapshot.forEach((document) => {
        const canvasID = document.id
        canvases[canvasID] = document.data()
      })
    })
    .catch((error) => {
      console.log(error)
    })
}

const initializeProfile = () => {
  icon.value = ''
  profile.value = ''
  canvases.value = ''
}

const userCol = () => {
  if (authStore.uid === route.params.user_id) {
    return 'col-span-12 sm:col-span-9 sm:ml-8'
  }
  return 'sm:mx-8'
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
    div(v-if="isValidUser" class="relative sm:static sm:grid sm:grid-cols-12 pb-4 border-b")
      div(class="col-span-10 sm:flex")
        div
          img(:src="icon" class="avatar ring-2 ring-gray-700 ")
        div(class="flex flex-col justify-around text-midnightBlue mt-4 sm:mt-0 sm:ml-4")
          p(class="text-xl lg:text-2xl font-bold") {{ name }}
          p(class="text-xs sm:text-sm  whitespace-pre-wrap") {{ profile }}
      div(v-if="authStore.uid === route.params.user_id" class="col-span-2 absolute sm:static top-4 right-0 mx-auto")
        router-link(to="/profile/settings") 
          button(class="focus:outline-none text-white bg-seaPink hover:bg-red-400 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-3 py-1") 編集
    div(v-else-if="isValidUser===false")
      h1(class="text-center text-xl font-bold mt-4") このアカウントは存在しません
    //- bottom
    div(class="my-8 grid gap-4 xl:grid-cols-3 md:grid-cols-2")      
      div(v-for="(canvas, index) of canvases" :key="index" class="picture m-auto")
        router-link(:to="{name: 'Create', params: { canvas_id: index }}")
          div(class="flex items-center")  
            img(v-if='canvas.image' :src="canvas.image" class="bg-gray-200 rounded-lg border border-gray-500" style="width: 320px; height: 180px")
            img(v-else class="bg-gray-200 rounded-lg border border-gray-500" style="width: 320px; height: 180px")
          div(class="flex mt-2")  
            div(class="text-midnightBlue pl-2") {{ canvas.name }}
</template>

<style scoped>
.avatar {
  vertical-align: middle;
  width: 80px;
  height: 80px;
  border-radius: 50%;
}
</style>
