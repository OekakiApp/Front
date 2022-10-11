<script setup lang="ts">
import { storeToRefs } from 'pinia'
import useStoreLine from '../stores/konva/line'
import ColorButton from './ToolBar/ColorButton.vue'
import StrokeWidthRange from './ToolBar/StrokeWidthRange.vue'

export type Color = 'red' | 'blue' | 'green'

const { tool } = storeToRefs(useStoreLine())
const { setTool, setGlobalCompositeOperation } = useStoreLine()
const colors: Color[] = ['red', 'blue', 'green']
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

    ColorButton(v-for="color of colors" :key="color" :color="color")
    
    StrokeWidthRange

</template>
