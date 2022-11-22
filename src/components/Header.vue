<script setup lang="ts">
import { storeToRefs } from 'pinia'
import useAuthStore from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const route = useRoute()
const router = useRouter()
const isLoginPage = ref(route.path === '/login')
const isSignUpPage = ref(route.path === '/sign_up')
router.afterEach(() => {
  isLoginPage.value = route.path === '/login'
  isSignUpPage.value = route.path === '/sign_up'
})
const authStore = useAuthStore()
const { isLoggedIn, icon } = storeToRefs(authStore)

const isOpen = ref(false)

const windowSize = ref(window.innerWidth)

onMounted(() => {
  window.addEventListener('resize', calculateWindowWidth)
})

const calculateWindowWidth = () => {
  windowSize.value = window.innerWidth
}
</script>

<template lang="pug">
nav(class="bg-bleachWhite px-2 sm:px-4 py-2.5 rounded　")
  div(class="container flex flex-wrap justify-between items-center mx-auto")
    router-link(:to="isLoggedIn ? '/works' : '/'")
      h1(class="text-midnightBlue text-xl font-bold") Graimer
    div
      div(v-if="isLoggedIn")
        router-link(v-if='windowSize >= 640' to="/users")  
          img(:src="icon" class="mini-avatar ring-2 ring-gray-700")
        div(v-else class="relative")
          button(class="relative z-10 block" @click="isOpen = !isOpen")
            img(:src="icon" class="mini-avatar ring-2 ring-gray-700")
          button(v-show="isOpen" tabindex="-1" class="z-10 fixed inset-0 h-full w-full cursor-default" @click="isOpen = false")
          div(v-show="isOpen"  class="absolute right-0 z-10 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl" @click="isOpen = false")
            router-link(to="/users" class="block px-4 py-2 text-gray-800 hover:bg-gray-100") ユーザー情報
            a(class="block cursor-pointer px-4 py-2 text-gray-800 hover:bg-gray-100" @click="authStore.logout()") ログアウト
            
      ul(v-else class="flex text-sm p-2 space-x-2 rounded-lg sm:space-x-8 sm:text-lg sm:font-medium")
        li
          router-link(to="/sign_up" class=" text-midnightBlue hover:text-dustyOrange" :class='{"text-dustyOrange": isSignUpPage}') 新規登録
        li
          router-link(to="/login" class="text-midnightBlue hover:text-dustyOrange" :class='{"text-dustyOrange": isLoginPage}') ログイン
</template>

<style scoped>
.mini-avatar {
  vertical-align: middle;
  width: 55px;
  height: 55px;
  border-radius: 50%;
}

@media screen and (max-width: 639px) {
  .mini-avatar {
    width: 45px;
    height: 45px;
  }
}
</style>
