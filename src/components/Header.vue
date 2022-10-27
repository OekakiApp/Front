<script setup lang="ts">
import { storeToRefs } from 'pinia'
import useAuthStore from '@/stores/auth'

const authStore = useAuthStore()
const { isLoggedIn, icon } = storeToRefs(authStore)
</script>

<template lang="pug">
nav(class="bg-bleachWhite px-2 sm:px-4 py-2.5 rounded")
  div(class="container flex flex-wrap justify-between items-center mx-auto")
    router-link(to="/")
      h1(class="text-midnightBlue text-xl font-bold") App Name
    div
      div(v-if="isLoggedIn")
        router-link(to="users")
          img(:src="icon" class="mini-avatar ring-2 ring-gray-700 ")
      ul(v-else class="flex flex-col p-2 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0")
        li
          router-link(to="sign_up" class="text-lg text-midnightBlue") 新規登録
        li
          router-link(to="login" class="text-lg text-dustyOrange") ログイン
</template>

<style scoped>
.mini-avatar {
  vertical-align: middle;
  width: 55px;
  height: 55px;
  border-radius: 50%;
}
</style>
