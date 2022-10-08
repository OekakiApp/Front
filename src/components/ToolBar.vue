<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import useStoreLine from '../stores/konva/line'
import ColorButton from './ToolBar/ColorButton.vue'

export type Color = 'red' | 'green' | 'blue'

const { drawMode } = storeToRefs(useStoreLine())
const { setStrokeWidth } = useStoreLine()
const colors: Color[] = ['red', 'green', 'blue']

const selectedStrokeWidth = ref()
</script>

<template lang="pug">

.flex.justify-center 
  div(class="flex justify-center p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 mt-3")
    ul.flex 
      li.flex.mr-2
        button(v-show="!drawMode" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="drawMode = !drawMode")
          span(class="material-symbols-outlined") edit 
        button(v-show="drawMode" class="bg-blue-500 hover:bg-blue-500 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="drawMode = !drawMode")
          span(class="material-symbols-outlined") edit 
      li.flex.mr-2
        button(class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded")
          span(class="material-symbols-outlined") undo 
      li.flex.mr-2
        button(class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded")
          span(class="material-symbols-outlined") redo 
  
.flex.justify-center 
    div(v-if="drawMode" class="flex p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 absolute mt-3")
      ColorButton(v-for="color of colors" :key="color" :color="color")
      div(class="block") 
        label(for="default-range" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300 text-center") Stroke Width 
        input(
          id="font-size"
          ref="selectedStrokeWidth"
          type="range"
          value="1"
          min="1"
          max="10"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          @change="setStrokeWidth(selectedStrokeWidth.value)")
</template>
