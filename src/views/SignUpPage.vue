<script setup lang="ts">
import { reactive } from 'vue'

interface InputTextInterface {
  icon: string
  inputType: string
  placeholder: string
  text: string
  isAlert: boolean
  alertText: string
}

const inputTexts: InputTextInterface[] = reactive([
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
const signUp = () => {
  inputTexts.map((_inputText) => {
    const inputText: InputTextInterface = _inputText
    const isBlankPasswordAndNowRePassword: boolean = inputTexts[2].text === '' && inputText.icon === 'key'
    if (inputText.text === '' && !isBlankPasswordAndNowRePassword) {
      inputText.isAlert = true
    } else {
      inputText.isAlert = false
    }
    return inputText
  })
}
</script>

<template lang="pug">
div(class="mt-16 my-8 lg:w-1/2 w-4/5 m-auto")
  h2(class="sm:text-4xl text-2xl font-bold text-midnightBlue text-center md:mb-20 mb-12") 新規登録
  form(class="mx-auto")
    div(v-for="(inputText, index) in inputTexts" :key="index" class="mb-8")
      div(v-show="inputText.isAlert" class="w-full p-2 my-4 text-sm text-blue-700 bg-blue-100 rounded-lg" role="alert")
        span(class="font-medium") {{inputText.alertText}}

      div(class="flex items-center justify-center w-full")
        span(class="material-symbols-outlined mr-2") {{inputText.icon}}
        div(class="w-full flex-fill mb-0")
          input(
:id="inputText.icon" v-model="inputText.text" :type="inputText.inputType" :placeholder="inputText.placeholder" :value="inputText.text" 
  class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5" required)

    div(class="flex justify-center items-center mb-4")
      button(@click="signUp" type="button" class="focus:outline-none text-white bg-seaPink hover:bg-red-400 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-5 py-2.5") 新規登録

    div
      p(class="text-right") ログインは
        router-link(to="/login" class="text-blue-500 underline") こちら
</template>
