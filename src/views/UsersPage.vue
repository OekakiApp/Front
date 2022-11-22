<script setup lang="ts">
import { storeToRefs } from 'pinia'
import useAuthStore from '@/stores/auth'

const authStore = useAuthStore()
const { name, icon, profile } = storeToRefs(useAuthStore())
</script>

<template lang="pug">
div(class="grid grid-cols-12 mt-4 sm:mt-8")
  //- left
  div(class="col-span-3 lg:col-span-2 sm:block hidden")
    div(class="border rounded-lg p-4")
      ul(class="text-midnightBlue")
        li(class="border-b pb-2")
          router-link(to="users" class="text-dustyOrange block") ユーザー情報
        //- li(class="border-b py-2")
        //-   a(href="#" class="block") ブックマーク
        //- li(class="border-b py-2")
        //-   a(href="#" class="block") 設定
        li(class="pt-2")
          button(class="block" @click="authStore.logout()") ログアウト
  //- right
  div(class="col-span-12 sm:col-span-9 sm:ml-8")
    //- top
    div(class="relative sm:static sm:grid sm:grid-cols-12 pb-4 border-b")
      div(class="col-span-10 sm:flex")
        div
          img(:src="icon" class="avatar ring-2 ring-gray-700 ")
        div(class="flex flex-col justify-around text-midnightBlue mt-4 sm:mt-0 sm:ml-4")
          p(class="text-xl lg:text-2xl font-bold") {{ name }}
          p(class="text-xs sm:text-sm  whitespace-pre-wrap") {{ profile }}
      div(class="col-span-2 absolute sm:static top-4 right-0 mx-auto")
        router-link(to="/profile/settings") 
          button(class="focus:outline-none text-white bg-seaPink hover:bg-red-400 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-3 py-1") 編集
          
    //- bottom
    div(class="my-8 grid gap-4 xl:grid-cols-3 md:grid-cols-2")      
      div(v-for="(canvas, index) of authStore.canvases" :key="index" class="picture m-auto")
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
