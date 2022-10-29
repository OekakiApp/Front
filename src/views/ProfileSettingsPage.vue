<script setup lang="ts">
import { reactive } from 'vue'
import router from '@/router'

const inputText = reactive({
  icon: 'person',
  inputType: 'text',
  placeholder: 'Type Your Email',
  text: 'Name',
  isAlert: false,
  alertText: '名前を入力してください',
  label: '名前',
})

const textArea = reactive({
  icon: 'introduction',
  placeholder: 'Type Your Message',
  text: '好きなことは・・・',
  isAlert: false,
  alertText: '100字以内で入力してください',
  label: '自己紹介',
})

const saveProfile = (): void => {
  const alertFlag = validate()

  if (alertFlag) {
    router.push({ name: 'Users' })
  }
}

const validate = (): boolean => {
  // inputText
  inputText.isAlert = inputText.text === ''
  textArea.isAlert = textArea.text.length > 100

  if (inputText.isAlert === false && textArea.isAlert === false) {
    return true
  }
  return false
}
</script>
<template lang="pug">
div(class="flex max-w-3xl mx-auto mt-8") 
  //- left
  div(class="flex flex-col items-center")
    div(class="big-avatar bg-gray-200")
    a(href="#" class="text-midnightBlue text-center pt-2") 変更する

  //- right
  div(class="mx-auto w-3/5")
    form
      div(class="mb-4")
        div(v-show="inputText.isAlert" class="w-full p-2 my-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert")
          span(class="font-medium") {{inputText.alertText}}
        div
          label(class="block mb-2 font-medium text-midnightBlue") {{ inputText.label }}
          input(
        :id="inputText.icon" v-model="inputText.text" :type="inputText.inputType" :placeholder="inputText.placeholder" :value="inputText.text" 
          class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5" required)
      
      div
        div(v-show="textArea.isAlert" class="w-full p-2 my-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert")
          span(class="font-medium") {{textArea.alertText}}
        div
          label(class="block mb-2 font-medium text-midnightBlue") {{ textArea.label }}
          textarea(:id="textArea.icon" v-model="textArea.text" :placeholder="textArea.placeholder" rows="4" class="block p-2.5 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300")

      div(class="flex justify-center items-center mt-8")
        button(class="focus:outline-none text-white bg-chardonnay hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-500 font-medium rounded-lg px-5 py-2.5" @click="saveProfile") 保存する
</template>

<style scoped>
.big-avatar {
  vertical-align: middle;
  width: 150px;
  height: 150px;
  border-radius: 50%;
}
</style>
