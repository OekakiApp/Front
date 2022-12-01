<script setup lang="ts">
import { reactive } from 'vue'
import router from '@/router/index'
import useAuthStore from '@/stores/auth'
// import { InputTextType } from '@/types/index'
interface InputTextType {
  icon: string
  inputType: string
  placeholder: string
  text: string
  isAlert: boolean
  alertText: string
}
const authStore = useAuthStore()

const inputTexts: InputTextType[] = reactive([
  {
    icon: 'person',
    inputType: 'text',
    placeholder: '名前',
    text: '',
    isAlert: false,
    alertText: '名前を入力してください',
  },
  {
    icon: 'mail',
    inputType: 'email',
    placeholder: 'メールアドレス',
    text: '',
    isAlert: false,
    alertText: 'メールアドレスを入力してください',
  },
  {
    icon: 'lock',
    inputType: 'password',
    placeholder: 'パスワード6文字以上',
    text: '',
    isAlert: false,
    alertText: 'パスワードは6文字以上 入力してください',
  },
  {
    icon: 'key',
    inputType: 'password',
    placeholder: 'パスワード再入力',
    text: '',
    isAlert: false,
    alertText: 'パスワードが一致しません',
  },
])

const submitSignup = () => {
  const name = inputTexts[0].text
  const email = inputTexts[1].text
  const password = inputTexts[2].text
  validate()
  if (!inputTexts[2].isAlert && !inputTexts[3].isAlert) {
    authStore.signupEmail(email, password, name)
  } else {
    authStore.isAuthError = true
    // パスワードのエラー優先
    if (inputTexts[2].isAlert) {
      authStore.authErrorMessage = inputTexts[2].alertText
    } else if (inputTexts[3].isAlert) {
      authStore.authErrorMessage = inputTexts[3].alertText
    }
  }
}

const validate = () => {
  const password = inputTexts[2].text
  const rePassword = inputTexts[3].text

  inputTexts[2].isAlert = password.length < 6
  inputTexts[3].isAlert = rePassword !== password
}

router.beforeEach(() => {
  useAuthStore().isAuthError = false
  useAuthStore().authErrorMessage = ''
})
</script>

<template lang="pug">
div(class="mt-16 my-8 lg:w-1/2 w-4/5 m-auto")
  h2(class="sm:text-4xl text-2xl font-bold text-midnightBlue text-center md:mb-20 mb-12") 新規登録
  form(class="mx-auto" @submit.prevent="submitSignup")
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
      button(type="submit" class="focus:outline-none text-white bg-seaPink hover:bg-red-400 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-5 py-2.5") 新規登録

    div
      p(class="text-right") ログインは
        router-link(to="/login" class="text-blue-500 underline") こちら
</template>
