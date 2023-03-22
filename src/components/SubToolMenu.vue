<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import LineStyleSelect from '@/components/ToolBar/LineStyleSelect.vue'
import ColorButton from '@/components/ToolBar/ColorButton.vue'
import StrokeWidthRange from '@/components/ToolBar/StrokeWidthRange.vue'
import FontSizeSelect from '@/components/ToolBar/FontSizeSelect.vue'
import FontFamilySelect from '@/components/ToolBar/FontFamilySelect.vue'
import TextAlignmentSelect from '@/components/ToolBar/TextAlignmentSelect.vue'
import useStoreMode from '@/stores/mode'
import useStoreLine from '@/stores/konva/line'
import useStoreText from '@/stores/konva/text'
import useStoreImage from '@/stores/konva/image'
import useStoreUserImage from '@/stores/userImage'

interface Color {
  name: string
  type: 'color-button' | 'color-picker'
  color: string
  style?: {
    'background-color': string
  }
  onClick: () => void
}

const { mode } = storeToRefs(useStoreMode())
const { isTouchActive } = storeToRefs(useStoreLine())
const { setLineColor, toggleIsTouchActive } = useStoreLine()
const { setTextOptionValue, setTextColor } = useStoreText()
const { setDragImageUrlAndId } = useStoreImage()
const { isLoadingImages, uploadedImages } = storeToRefs(useStoreUserImage())
const { addImageList, deleteImageFromToolbar } = useStoreUserImage()

const activeLineColorIndex = ref<number>(0)
const activeTextColorIndex = ref<number>(0)

const lineColors: Color[] = [
  {
    name: 'Black',
    type: 'color-button',
    color: '#1E1E1E',
    style: { 'background-color': '#1E1E1E' },
    onClick: () => setLineColor('#1E1E1E'),
  },
  {
    name: 'Red',
    type: 'color-button',
    color: '#F24822',
    style: { 'background-color': '#F24822' },
    onClick: () => setLineColor('#F24822'),
  },
  {
    name: 'Orange',
    type: 'color-button',
    color: '#FFA629',
    style: { 'background-color': '#FFA629' },
    onClick: () => setLineColor('#FFA629'),
  },
  {
    name: 'Yellow',
    type: 'color-button',
    color: '#FFCD29',
    style: { 'background-color': '#FFCD29' },
    onClick: () => setLineColor('#FFCD29'),
  },
  {
    name: 'Green',
    type: 'color-button',
    color: '#14AE5C',
    style: { 'background-color': '#14AE5C' },
    onClick: () => setLineColor('#14AE5C'),
  },
  {
    name: 'Blue',
    type: 'color-button',
    color: '#0D99FF',
    style: { 'background-color': '#0D99FF' },
    onClick: () => setLineColor('#0D99FF'),
  },
  {
    name: 'Violet',
    type: 'color-button',
    color: '#9747FF',
    style: { 'background-color': '#9747FF' },
    onClick: () => setLineColor('#9747FF'),
  },
  {
    name: 'White',
    type: 'color-button',
    color: '#FFFFFF',
    style: { 'background-color': '#FFFFFF' },
    onClick: () => setLineColor('#FFFFFF'),
  },
  {
    name: 'Custom',
    type: 'color-picker',
    color: 'rainbow',
    // 便宜上何も設定しない関数を挿入する
    onClick: () => setLineColor(''),
  },
]

const textColors: Color[] = [
  {
    name: 'Black',
    type: 'color-button',
    color: '#1E1E1E',
    style: { 'background-color': '#1E1E1E' },
    onClick: () => {
      setTextColor('#1E1E1E')
      setTextOptionValue('textFillColor', '#1E1E1E')
    },
  },
  {
    name: 'Red',
    type: 'color-button',
    color: '#F24822',
    style: { 'background-color': '#F24822' },
    onClick: () => {
      setTextColor('#F24822')
      setTextOptionValue('textFillColor', '#F24822')
    },
  },
  {
    name: 'Orange',
    type: 'color-button',
    color: '#FFA629',
    style: { 'background-color': '#FFA629' },
    onClick: () => {
      setTextColor('#FFA629')
      setTextOptionValue('textFillColor', '#FFA629')
    },
  },
  {
    name: 'Yellow',
    type: 'color-button',
    color: '#FFCD29',
    style: { 'background-color': '#FFCD29' },
    onClick: () => {
      setTextColor('#FFCD29')
      setTextOptionValue('textFillColor', '#FFCD29')
    },
  },
  {
    name: 'Green',
    type: 'color-button',
    color: '#14AE5C',
    style: { 'background-color': '#14AE5C' },
    onClick: () => {
      setTextColor('#14AE5C')
      setTextOptionValue('textFillColor', '#14AE5C')
    },
  },
  {
    name: 'Blue',
    type: 'color-button',
    color: '#0D99FF',
    style: { 'background-color': '#0D99FF' },
    onClick: () => {
      setTextColor('#0D99FF')
      setTextOptionValue('textFillColor', '#0D99FF')
    },
  },
  {
    name: 'Violet',
    type: 'color-button',
    color: '#9747FF',
    style: { 'background-color': '#9747FF' },
    onClick: () => {
      setTextColor('#9747FF')
      setTextOptionValue('textFillColor', '#9747FF')
    },
  },
  {
    name: 'White',
    type: 'color-button',
    color: '#FFFFFF',
    style: { 'background-color': '#FFFFFF' },
    onClick: () => {
      setTextColor('#FFFFFF')
      setTextOptionValue('textFillColor', '#FFFFFF')
    },
  },
  {
    name: 'Custom',
    type: 'color-picker',
    color: 'rainbow',
    // 便宜上何も設定しない関数を挿入する
    onClick: () => setLineColor(''),
  },
]
</script>

<template lang="pug">
//- pen
div(v-if="mode === 'pen'" class="flex justify-center items-center bg-gray-200 rounded-lg border border-gray-400 shadow-md pt-2 pb-3 px-2 absolute -top-3/4 max-w-screen-md h-16")
  LineStyleSelect
  //- Not use Hand
  div(class="px-2")
    button(v-if="isTouchActive" type="button" data-tip="Not use touch" class="tooltip flex justify-center items-center w-8 h-8 hover:bg-slate-300 rounded-full" @click="toggleIsTouchActive")
      span(class="material-symbols-outlined") do_not_touch
    button(v-else type="button" data-tip="Not use touch" class="tooltip flex justify-center items-center w-8 h-8 bg-slate-300 rounded-full" @click="toggleIsTouchActive")
      span(class="material-symbols-outlined") do_not_touch
  ColorButton(
    v-for="(color, index) in lineColors"
    :key="color.color" :color="color" :index="index"
    :active-index="activeLineColorIndex"
    @toggle-button-active="(index:number) => activeLineColorIndex = index"
    @toggle-picker-active="(index:number, color: string) => {activeLineColorIndex = index;setLineColor(color)}")
  div(class="pl-2")
    StrokeWidthRange
//- eraser
div(
  v-else-if="mode === 'eraser'"
  class="flex justify-center items-center bg-gray-200 rounded-lg border border-gray-400 shadow-md pt-2 pb-3 px-2 absolute -top-3/4 max-w-screen-md h-16")
  StrokeWidthRange
//- text
div(v-else-if="mode === 'text'" class="flex justify-center items-center bg-gray-200 rounded-lg border border-gray-400 shadow-md pt-2 pb-3 px-2 absolute -top-3/4 max-w-screen-md h-16")
  FontSizeSelect
  FontFamilySelect
  TextAlignmentSelect
  ColorButton(
    v-for="(color, index) in textColors"
    :key="color.color" :color="color"
    :index="index" :active-index="activeTextColorIndex"
    @toggle-button-active="(index:number) => activeTextColorIndex = index"
    @toggle-picker-active="(index:number, color:string) =>{activeTextColorIndex = index;setTextColor(color);setTextOptionValue('textFillColor', color)}")
//- image
div(v-else-if="mode === 'image'" class="flex justify-center items-center bg-gray-200 rounded-lg border border-gray-400 shadow-md pt-2 pb-6 px-2 absolute bottom-3/4 max-w-screen-sm w-screen")
  div(class="flex items-end h-52 w-full")
    label(class="upload-label bg-neutral inline-block cursor-pointer rounded-lg py-2 px-5 text-white text-lg") ファイルを選択
      input(type="file" class="bg-white file-input file-input-bordered file-input-sm min-w-min rounded-lg" accept=".png, .jpeg, .jpg" @change="addImageList")
    //- 画像読み込み中はLoading
    div(v-if="isLoadingImages" class="bg-slate-50 flex justify-center items-center w-full h-52 overflow-y-scroll rounded-lg ml-2")
      div(role="status")
        svg(class="inline mr-2 w-20 h-20 text-gray-200 animate-spin dark:text-gray-600 fill-yellow-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg")
          path(d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor")
          path(d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill")
        span(class="sr-only") Loading...
    //- image list
    div(v-else class="bg-slate-50 flex-1 grid grid-cols-3 h-52 w-full overflow-y-scroll rounded-lg ml-2")
      div(v-for="image of uploadedImages" :key="image.id" class="relative flex justify-center items-center")
        button(type="button" class="flex justify-center items-center absolute top-0 right-0 w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 m-1" @click="async () => {await deleteImageFromToolbar(image);}") ✕
        img(:id="image.id" :src="image.storageURL" class="w-full aspect-auto col-span-1 p-2 hover:cursor-grab active:cursor-grabbing" @dragstart="(e) => {setDragImageUrlAndId(e);}")
</template>

<style scoped>
.upload-label input {
  display: none;
}
</style>
