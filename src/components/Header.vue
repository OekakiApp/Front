<script setup lang="ts">
import useAuthStore from '../stores/auth'

const authStore = useAuthStore()
</script>

<template lang="pug">
nav(class="bg-bleachWhite px-2.sm:px-4 py-2.5 rounded")
  div(class="container flex flex-wrap justify-between items-center mx-auto")
    router-link(to="/")
      h1(class="text-midnightBlue text-xl font-bold") App Name
    div
      ul(class="flex flex-col p-4 mt-4 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0")
        li(v-if="authStore.isLoggedIn") こんにちは! {{ authStore.name }} さん
        li(v-else) まだログインしてないよ
        li
          router-link(to="sign_up" class="text-midnightBlue") 新規登録
        li
          router-link(to="login" class="text-dustyOrange") ログイン
        li
          router-link(to="users" class="text-midnightBlue") ユーザー
</template>
