<script setup lang="ts">
import { storeToRefs } from 'pinia'
import useAuthStore from '../stores/auth'
const authStore = useAuthStore()
const { name } = storeToRefs(useAuthStore())
</script>

<template lang="pug">
div(class="grid grid-cols-12 mt-8")
  //- left
  div(class="col-span-2")
    div(class="border rounded-lg p-4")
      ul(class="text-midnightBlue")
        li(class="border-b pb-2")
          a(href="#" class="text-dustyOrange block") ユーザー情報
        li(class="border-b py-2")
          a(href="#" class="block") ブックマーク
        li(class="border-b py-2")
          a(href="#" class="block") 設定
        li(class="pt-2")
          button(@click="authStore.logout()" class="block") ログアウト
  //- right
  div(class="col-span-9 ml-8")
    //- top
    div(class="flex justify-between pb-4 border-b")
      div(class="flex")
        div(class="avatar bg-gray-200")
        div(class="flex flex-col justify-center text-midnightBlue ml-4")
          p(class="text-xl font-bold") {{ name }}
          p(class="text-sm") 自己紹介: 好きな食べ物は...
      div(class="mr-8")
        router-link(to="/profile/settings") 
          button(class="focus:outline-none text-white bg-seaPink hover:bg-red-400 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-3 py-1") 編集
          
    //- bottom
    div(class="my-8 grid gap-4 xl:grid-cols-3 md:grid-cols-2")
      div(class="picture mx-auto")
        a(href="")
          div(class="flex justify-center items-center border-dashed border-2 rounded-lg" style="width: 240px; height: 135px")
            p(class="text-5xl text-gray-400") +
      
      div(v-for="n of 4" :key="n" class="picture m-auto")
        a(href="")
          div(class="bg-gray-200 rounded-lg" style="width: 240px; height: 135px")
        div(class="flex mt-2")
          a(href="" class="text-midnightBlue pl-2") Title
</template>

<style scoped>
.avatar {
  vertical-align: middle;
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
</style>
