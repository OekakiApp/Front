<script setup lang="ts">
import { storeToRefs } from 'pinia'
import useStoreMode from '@/stores/mode'
import useStoreLine from '@/stores/konva/line'
import SubToolMenu from '@/components/SubToolMenu.vue'

const { mode } = storeToRefs(useStoreMode())
const { setMode } = useStoreMode()
const { setLineStyle, setGlobalCompositeOperation } = useStoreLine()
</script>

<template lang="pug">
div(class="flex flex-col items-center absolute bottom-2 left-1/2 -translate-x-1/2")
  SubToolMenu
  div(class="flex justify-center items-center px-4 py-3 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 mx-auto")
    ul.flex
      //- Select
      li.flex.mx-2
        button(v-show="mode !== 'select'" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="() => {setMode('select');}")
          span(class="material-symbols-outlined") navigation
        button(v-show="mode === 'select'" class="bg-blue-500 hover:bg-blue-500 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="setMode('none')")
          span(class="material-symbols-outlined") navigation
      //- Hand
      li.flex.mx-2
        button(v-show="mode !== 'hand'" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="() => {setMode('hand');}")
          span(class="material-symbols-outlined") pan_tool 
        button(v-show="mode === 'hand'" class="bg-blue-500 hover:bg-blue-500 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="setMode('none')")
          span(class="material-symbols-outlined") pan_tool
      //- Pen
      li.flex.mx-2
        button(v-show="mode !== 'pen'" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="() => {setMode('pen');setGlobalCompositeOperation(mode);}")
          span(class="material-symbols-outlined") edit 
        button(v-show="mode === 'pen'" class="bg-blue-500 hover:bg-blue-500 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="setMode('none')")
          span(class="material-symbols-outlined") edit 
      //- Eraser
      li.flex.mx-2
        button(v-show="mode !== 'eraser'" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="() => {setMode('eraser');setLineStyle('normal');setGlobalCompositeOperation(mode);}")
          span(class="material-symbols-outlined") auto_fix_normal 
        button(v-show="mode === 'eraser'" class="bg-blue-500 hover:bg-blue-500 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="setMode('none')")
          span(class="material-symbols-outlined") auto_fix_normal 
      //- Text
      li.flex.mx-2
        button(v-show="mode !== 'text'" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="() => {setMode('text');}")
          span(class="material-symbols-outlined") title 
        button(v-show="mode === 'text'" class="bg-blue-500 hover:bg-blue-500 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="setMode('none')")
          span(class="material-symbols-outlined") title 
      //- Sticky
      li.flex.mx-2
        button(v-show="mode !== 'sticky'" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="() => {setMode('sticky');}")
          span(class="material-symbols-outlined") sticky_note_2 
        button(v-show="mode === 'sticky'" class="bg-blue-500 hover:bg-blue-500 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="setMode('none')")
          span(class="material-symbols-outlined") sticky_note_2 
      //- Image
      li.flex.mx-2
        button(v-show="mode !== 'image'" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded")
          span(class="material-symbols-outlined") image 
        button(v-show="mode === 'image'" class="bg-blue-500 hover:bg-blue-500 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded")
          span(class="material-symbols-outlined") image 
      //- Undo
      li.flex.mx-2
        button(class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded")
          span(class="material-symbols-outlined") undo 
      //- Redo
      li.flex.mx-2
        button(class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded")
          span(class="material-symbols-outlined") redo 
</template>
