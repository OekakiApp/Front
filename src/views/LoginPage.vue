<script setup lang="ts">
import { reactive } from 'vue'
import router from '@/router/index'
import useAuthStore from '@/stores/auth'

interface InputTextType {
  icon: string
  inputType: string
  placeholder: string
  text: string
}
const authStore = useAuthStore()

const inputTexts: InputTextType[] = reactive([
  {
    icon: 'mail',
    inputType: 'email',
    placeholder: 'メールアドレス',
    text: '',
  },
  {
    icon: 'key',
    inputType: 'password',
    placeholder: 'パスワード',
    text: '',
  },
])

const submitLogin = () => {
  const email = inputTexts[0].text
  const password = inputTexts[1].text
  authStore.loginEmail(email, password)
}

router.beforeEach(() => {
  useAuthStore().isAuthError = false
  useAuthStore().authErrorMessage = ''
})
</script>

<template lang="pug">
div(class="mt-16 my-8 lg:w-1/2 w-4/5 m-auto")
  h2(class="sm:text-4xl text-2xl font-bold text-midnightBlue text-center md:mb-20 mb-12") ログイン
  form(class="mx-auto" @submit.prevent="submitLogin")
    //- alert
    div(v-show='authStore.isAuthError' class="w-full p-2 my-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert")
      span(class="font-medium whitespace-pre-wrap") {{authStore.authErrorMessage}}
    div(v-for="(inputText, index) in inputTexts" :key="index" class="mb-8")
      div(class="flex items-center justify-center w-full")
        span(class="material-symbols-outlined mr-2") {{inputText.icon}}
        div(class="w-full flex-fill mb-0")
          input(
:id="inputText.icon" v-model="inputText.text" :type="inputText.inputType" :placeholder="inputText.placeholder"
            class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5" required)

    div(class="flex justify-center items-center mb-4")
      button(type="submit" class="focus:outline-none text-white bg-seaPink hover:bg-red-400 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-5 py-2.5") ログイン

    div
      p(class="text-right") 新規登録は
        router-link(to="/sign_up" class="text-blue-500 underline") こちら
</template>
