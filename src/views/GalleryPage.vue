<script setup lang="ts">
import { ref, reactive } from 'vue'
const modalWidth =
  window.innerWidth <= 400
    ? ref(window.innerWidth * 0.9)
    : ref(window.innerWidth * 0.7)
const modalHeight = ref((modalWidth.value * 9) / 16)

const modalStyle = reactive({
  width: modalWidth.value + 'px',
  height: modalHeight.value + 'px',
})

const resizeModal = () => {
  modalWidth.value =
    window.innerWidth <= 400 ? window.innerWidth * 0.9 : window.innerWidth * 0.7
  modalHeight.value = (modalWidth.value * 9) / 16
  modalStyle.width = modalWidth.value + 'px'
  modalStyle.height = modalHeight.value + 'px'
}
</script>

<template lang="pug">
div(class="my-8 grid gap-4 xl:grid-cols-3 md:grid-cols-2")
  div(v-for="n of 9" :key="n" class="picture m-auto")
    label(@click="resizeModal()" for="modal" class="flex items-center")
      div(class="bg-gray-200 rounded-lg border border-gray-500 relative" style="width: 320px; height: 180px")
        div(class="heart absolute cursor-pointer" style="right: 10px; bottom: 10px")
      
    div(class="flex flex-col mt-1 ml-2")  
      div(class="text-midnightBlue") タイトル
      div(class="flex items-center mt-1") 
        div(class="tiny-avatar ring-2 bg-gray-200 ring-gray-700 ")
        div(class="text-midnightBlue text-sm pl-2") ネーム

input(type="checkbox" id="modal" class="modal-toggle")
label(for="modal" class="modal cursor-pointer")
  div(class="bg-gray-200 rounded-lg border border-gray-500 relative" :style="modalStyle")

        
</template>

<style scoped>
.tiny-avatar {
  vertical-align: middle;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.heart {
  width: 20px;
  /* 正方形を作る */
  height: 20px;
  /* 正方形を作る */
}

.heart::before,
.heart::after {
  content: '';
  /* 疑似要素に必須 */
  width: 50%;
  /* ハートの丸い部分の大きさにかかわる */
  height: 80%;
  /* ハートの高さにかかわる */
  background: #e0548e;
  /* ハートの色 */
  border-radius: 25px 25px 0 0;
  /* ハートの半円を生成 */
  display: block;
  /* ブロック要素にする */
  position: absolute;
  /* 相対位置に指定 */
}

.heart::before {
  transform: rotate(-45deg);
  /* 左に回転 */
  left: 14%;
  /* 左からの位置を指定 */
}

.heart::after {
  transform: rotate(45deg);
  /* 右に回転 */
  right: 14%;
  /* 右からの位置を指定 */
}
</style>
