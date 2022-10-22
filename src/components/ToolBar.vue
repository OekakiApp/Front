<script setup lang="ts">
import { reactive } from 'vue'
import { storeToRefs } from 'pinia'
import useStoreMode, { type Mode } from '@/stores/mode'
import useStoreLine from '@/stores/konva/line'
import SubToolMenu from '@/components/SubToolMenu.vue'

const { mode } = storeToRefs(useStoreMode())
const { setMode } = useStoreMode()
const { setLineStyle, setGlobalCompositeOperation } = useStoreLine()

const toolArray: {
  icon: string
  mode: Mode
  event: () => void
}[] = reactive([
  {
    icon: 'navigation',
    mode: 'select',
    event: () => {
      setMode('select')
    },
  },
  {
    icon: 'pan_tool',
    mode: 'hand',
    event: () => {
      setMode('hand')
    },
  },
  {
    icon: 'edit',
    mode: 'pen',
    event: () => {
      setMode('pen')
      setGlobalCompositeOperation(mode.value)
    },
  },
  {
    icon: 'auto_fix_normal',
    mode: 'eraser',
    event: () => {
      setMode('eraser')
      setLineStyle('normal')
      setGlobalCompositeOperation(mode.value)
    },
  },
  {
    icon: 'title',
    mode: 'text',
    event: () => {
      setMode('text')
    },
  },
  {
    icon: 'sticky_note_2',
    mode: 'sticky',
    event: () => {
      setMode('sticky')
    },
  },
  {
    icon: 'image',
    mode: 'image',
    event: () => {
      setMode('image')
    },
  },
])
</script>

<template lang="pug">
div(class="flex flex-col items-center absolute bottom-2 left-1/2 -translate-x-1/2")
  SubToolMenu
  div(class="flex justify-center items-center px-4 py-3 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 mx-auto")
    ul.flex
      //- select hand pen text sticky image
      li(v-for="(tool, index) of toolArray" :key="index" class="flex mx-2")
        button(v-show="mode !== tool.mode" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="tool.event")
          span(class="material-symbols-outlined") {{tool.icon}}
        button(v-show="mode === tool.mode" class="bg-blue-500 hover:bg-blue-500 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="setMode('none')")
          span(class="material-symbols-outlined") {{tool.icon}}
      //- Undo
      li.flex.mx-2
        button(class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded")
          span(class="material-symbols-outlined") undo 
      //- Redo
      li.flex.mx-2
        button(class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded")
          span(class="material-symbols-outlined") redo 
</template>
