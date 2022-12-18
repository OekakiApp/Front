<script setup lang="ts">
import { ref, reactive } from 'vue'

const modalWidth =
  window.innerWidth <= 400
    ? ref(window.innerWidth * 0.9)
    : ref(window.innerWidth * 0.7)
const modalHeight = ref((modalWidth.value * 9) / 16)

const modalStyle = reactive({
  width: `${modalWidth.value}px`,
  height: `${modalHeight.value}px`,
})

const resizeModal = () => {
  modalWidth.value =
    window.innerWidth <= 400 ? window.innerWidth * 0.9 : window.innerWidth * 0.7
  modalHeight.value = (modalWidth.value * 9) / 16
  modalStyle.width = `${modalWidth.value}px`
  modalStyle.height = `${modalHeight.value}px`
}

const galleries = reactive([
  {
    title: 'エアリアル',
    name: 'スレッタ',
    avatar: 'https://g-witch.net/gwitch/jp/character/2022/10/01_front_s_2.png',
    isLike: false,
  },
  {
    title: 'ディランザ',
    name: 'グエル',
    avatar: 'https://g-witch.net/gwitch/jp/character/2022/10/03_front_s.png',
    isLike: false,
  },
  {
    title: 'ファラクト',
    name: 'エラン',
    avatar: 'https://g-witch.net/gwitch/jp/character/2022/10/04_front_s_2.png',
    isLike: false,
  },
  {
    title: 'ミカエリス',
    name: 'シャディク',
    avatar: 'https://g-witch.net/gwitch/jp/character/2022/10/05_front_s.png',
    isLike: false,
  },
])

const likeColor = (isLike: boolean) => (isLike ? 'fill: red' : 'fill: #fff')
</script>

<template lang="pug">
div(class="my-8 grid gap-4 xl:grid-cols-3 md:grid-cols-2")
  div(v-for="(gallery, index) of galleries" :key="index" class="picture m-auto")
    div(class="flex items-center relative")
      label(for="modal" class="bg-gray-200 rounded-lg border border-gray-500" style="width: 320px; height: 180px" @click="resizeModal()")
      svg(class="heart absolute cursor-pointer" viewBox="0 0 32 29.6" :style="likeColor(gallery.isLike)" style="right: 10px; bottom: 10px" @click="gallery.isLike = !gallery.isLike")
        path(d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z")
    div(class="flex flex-col mt-1 ml-2")  
      div(class="text-midnightBlue") {{ gallery.title }}
      div(class="flex items-center mt-1") 
        img(:src="gallery.avatar" class="tiny-avatar ring-2 bg-gray-200 ring-gray-700 ")
        div(class="text-midnightBlue text-sm pl-2") {{ gallery.name }}

input(id="modal" type="checkbox" class="modal-toggle")
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
}
</style>
