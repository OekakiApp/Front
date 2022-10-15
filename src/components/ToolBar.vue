<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import useStoreLine from '../stores/konva/line'
import ColorButton from './ToolBar/ColorButton.vue'
import StrokeWidthRange from './ToolBar/StrokeWidthRange.vue'
import ColorPickerPalette from './ToolBar/ColorPickerPalette.vue'

export type Color = {
  color: string
  style: {
    'background-color'?: string
    background?: string
  }
  onClick: () => void
}

const { tool } = storeToRefs(useStoreLine())
const { setTool, setColor, setGlobalCompositeOperation } = useStoreLine()

const paletteIsOpen = ref(false)
const activeIndex = ref<number | null>(null)

const colors: Color[] = [
  {
    color: '#1E1E1E',
    style: { 'background-color': '#1E1E1E' },
    onClick: () => setColor('#1E1E1E'),
  },
  {
    color: '#F24822',
    style: { 'background-color': '#F24822' },
    onClick: () => setColor('#F24822'),
  },
  {
    color: '#FFA629',
    style: { 'background-color': '#FFA629' },
    onClick: () => setColor('#FFA629'),
  },
  {
    color: '#FFCD29',
    style: { 'background-color': '#FFCD29' },
    onClick: () => setColor('#FFCD29'),
  },
  {
    color: '#14AE5C',
    style: { 'background-color': '#14AE5C' },
    onClick: () => setColor('#14AE5C'),
  },
  {
    color: '#0D99FF',
    style: { 'background-color': '#0D99FF' },
    onClick: () => setColor('#0D99FF'),
  },
  {
    color: '#9747FF',
    style: { 'background-color': '#9747FF' },
    onClick: () => setColor('#9747FF'),
  },
  {
    color: '#FFFFFF',
    style: { 'background-color': '#FFFFFF' },
    onClick: () => setColor('#FFFFFF'),
  },
  {
    color: 'rainbow',
    style: {
      background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
    },
    onClick: () => (paletteIsOpen.value = !paletteIsOpen.value),
  },
]
</script>

<template lang="pug">

.flex.justify-center 
  div(class="flex justify-center items-center p-6 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 mt-3")
    ul.flex
      //- Pen
      li.flex.mr-2
        button(v-show="tool !== 'pen'" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="() => {setTool('pen');setGlobalCompositeOperation()}")
          span(class="material-symbols-outlined") edit 
        button(v-show="tool === 'pen'" class="bg-blue-500 hover:bg-blue-500 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="setTool('none')")
          span(class="material-symbols-outlined") edit 
      //- Eraser
      li.flex.mr-2
        button(v-show="tool !== 'eraser'" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="() => {setTool('eraser');setGlobalCompositeOperation()}")
          span(class="material-symbols-outlined") delete
        button(v-show="tool === 'eraser'" class="bg-blue-500 hover:bg-blue-500 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="setTool('none')")
          span(class="material-symbols-outlined") delete
      //- Undo
      li.flex.mr-2
        button(class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded")
          span(class="material-symbols-outlined") undo 
      //- Redo
      li.flex.mr-2
        button(class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded")
          span(class="material-symbols-outlined") redo 

    ColorButton(v-for="(color, index) in colors" :key="color.color" :color="color" :index="index" :activeindex="activeIndex" @toggle-active="(index:number) => activeIndex = index")
    
    StrokeWidthRange

ColorPickerPalette(v-if="paletteIsOpen")

</template>
