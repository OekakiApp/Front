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

const { uploadedImages } = storeToRefs(useStoreImage())
const { setLineColor, toggleIsTouchActive } = useStoreLine()
const { setTextOptionValue, setTextColor } = useStoreText()
const { addImageList, removeImage, setDragUrl } = useStoreImage()

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
div(v-else-if="mode === 'image'" class="flex justify-center items-center bg-gray-200 rounded-lg border border-gray-400 shadow-md pt-2 pb-6 px-2 absolute bottom-3/4 max-w-screen-md")
  div(class="flex items-end h-full")
    input(type="file" class="bg-white file-input file-input-bordered file-input-sm max-w-xs rounded-lg" accept=".png, .jpeg, .jpg" @change="addImageList")
    div(v-if="uploadedImages.length !== 0" class="bg-slate-50 flex-1 grid grid-cols-3 max-h-72 overflow-y-scroll rounded-lg ml-2")
      //- image list
      div(v-for="image of uploadedImages" :key="image.id" class="relative")
        button(type="button" class="flex justify-center items-center absolute top-0 right-0 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 m-1" @click="() => {removeImage(image.id);}")
          span(class="font-bold") ✕
        img(:src="image.imgSrc" class="w-full aspect-auto col-span-1 p-2 hover:cursor-grab active:cursor-grabbing" @dragstart="(e) => {setDragUrl(e);}")
</template>
