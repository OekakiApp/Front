<script setup lang="ts">
import { storeToRefs } from 'pinia'
import useAuthStore from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()
const isLoginPage = ref(route.path === '/login')
const isSignUpPage = ref(route.path === '/sign_up')
const isGalleryPage = ref(route.path === '/gallery')
router.afterEach(() => {
  isLoginPage.value = route.path === '/login'
  isSignUpPage.value = route.path === '/sign_up'
  isGalleryPage.value = route.path === '/gallery'
})
const authStore = useAuthStore()
const { isLoggedIn, icon } = storeToRefs(authStore)
</script>

<template lang="pug">
nav(class="bg-bleachWhite px-2 sm:px-4 py-2.5 rounded")
  div(class="container flex flex-wrap justify-between items-center mx-auto")
    router-link(:to="isLoggedIn ? '/works' : '/'" class="flex justify-between items-center")
      h1(class="text-midnightBlue text-xl font-bold") Graimer
      div(v-if="isLoggedIn" class='ml-8')
        ul(class="flex flex-col p-2 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0")
          li
            router-link(to="/gallery" class="text-lg text-midnightBlue hover:text-dustyOrange" :class='{"text-dustyOrange": isGalleryPage}') ギャラリー
    div
      div(v-if="isLoggedIn")
        router-link(to="/users")
          img(:src="icon" class="mini-avatar ring-2 ring-gray-700 ")
      ul(v-else class="flex flex-col p-2 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0")
        li
          router-link(to="/sign_up" class="text-lg text-midnightBlue hover:text-dustyOrange" :class='{"text-dustyOrange": isSignUpPage}') 新規登録
        li
          router-link(to="/login" class="text-lg hover:text-dustyOrange" :class='{"text-dustyOrange": isLoginPage}') ログイン
</template>

<style scoped>
.mini-avatar {
  vertical-align: middle;
  width: 55px;
  height: 55px;
  border-radius: 50%;
}
</style>
