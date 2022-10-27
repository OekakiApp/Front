<script setup lang="ts">
import { reactive } from 'vue'
import useAuthStore from '@/stores/auth'

const authStore = useAuthStore()

type InputTextType = {
  icon: string
  inputType: string
  placeholder: string
  text: string
  isAlert: boolean
  alertText: string
}

const inputTexts: InputTextType[] = reactive([
  {
    icon: 'person',
    inputType: 'text',
    placeholder: 'Type Your Name',
    text: '',
    isAlert: false,
    alertText: '名前を入力してください',
  },
  {
    icon: 'mail',
    inputType: 'email',
    placeholder: 'Type Your Email',
    text: '',
    isAlert: false,
    alertText: 'メールアドレスを入力してください',
  },
  {
    icon: 'lock',
    inputType: 'password',
    placeholder: 'Type Your Password',
    text: '',
    isAlert: false,
    alertText: 'パスワードを入力してください',
  },
  {
    icon: 'key',
    inputType: 'password',
    placeholder: 'Repeat Your Password',
    text: '',
    isAlert: false,
    alertText: 'パスワードが一致しません',
  },
])

// TODO: 関数書き換え(map中 他textとの条件複雑になる) && 条件の見直し
const submitSignup = () => {
  const name = inputTexts[0].text
  const email = inputTexts[1].text
  const password = inputTexts[2].text
  validate()
  if (
    !inputTexts[0].isAlert &&
    !inputTexts[1].isAlert &&
    !inputTexts[2].isAlert &&
    !inputTexts[3].isAlert
  ) {
    authStore.signupEmail(email, password, name)
  }
}

const validate = () => {
  const name = inputTexts[0].text
  const email = inputTexts[1].text
  const password = inputTexts[2].text
  const rePassword = inputTexts[3].text

  inputTexts[0].isAlert = name === ''
  inputTexts[1].isAlert = email === ''
  inputTexts[2].isAlert = password === ''
  inputTexts[3].isAlert = rePassword !== password
}
</script>

<template lang="pug">
div(class="mt-16 my-8 lg:w-1/2 w-4/5 m-auto")
  h2(class="sm:text-4xl text-2xl font-bold text-midnightBlue text-center md:mb-20 mb-12") 新規登録
  form(class="mx-auto" @submit.prevent="submitSignup")
    div(v-for="(inputText, index) in inputTexts" :key="index" class="mb-8")
      //- alert
      div(v-show="inputText.isAlert" class="w-full p-2 my-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert")
        span(class="font-medium") {{inputText.alertText}}

      div(class="flex items-center justify-center w-full")
        span(class="material-symbols-outlined mr-2") {{inputText.icon}}
        div(class="w-full flex-fill mb-0")
          input(
:id="inputText.icon" v-model="inputText.text" :type="inputText.inputType" :placeholder="inputText.placeholder" :value="inputText.text" 
  class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5" required)

    div(class="flex justify-center items-center mb-4")
      button(type="submit" class="focus:outline-none text-white bg-seaPink hover:bg-red-400 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-5 py-2.5") 新規登録

    div
      p(class="text-right") ログインは
        router-link(to="/login" class="text-blue-500 underline") こちら
</template>
