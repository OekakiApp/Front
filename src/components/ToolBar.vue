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
  tooltip: string
  shortcut: string
  event: () => void
}[] = reactive([
  {
    icon: 'navigation',
    mode: 'select',
    tooltip: 'Select tool',
    shortcut: 'V',
    event: () => {
      setMode('select')
    },
  },
  {
    icon: 'pan_tool',
    mode: 'hand',
    tooltip: 'Hand tool',
    shortcut: 'H',
    event: () => {
      setMode('hand')
    },
  },
  {
    icon: 'edit',
    mode: 'pen',
    tooltip: 'Pen',
    shortcut: 'P',
    event: () => {
      setMode('pen')
      setGlobalCompositeOperation(mode.value)
    },
  },
  {
    icon: 'auto_fix_normal',
    mode: 'eraser',
    tooltip: 'Eraser',
    shortcut: 'Shift + Del',
    event: () => {
      setMode('eraser')
      setLineStyle('normal')
      setGlobalCompositeOperation(mode.value)
    },
  },
  {
    icon: 'title',
    mode: 'text',
    tooltip: 'Text',
    shortcut: 'T',
    event: () => {
      setMode('text')
    },
  },
  {
    icon: 'sticky_note_2',
    mode: 'sticky',
    tooltip: 'Sticky note',
    shortcut: 'S',
    event: () => {
      setMode('sticky')
    },
  },
  {
    icon: 'image',
    mode: 'image',
    tooltip: 'Image',
    shortcut: 'I',
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
        button(v-show="mode !== tool.mode" :data-tooltip-target="'tooltip-' + index" type="button" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="tool.event")
          span(class="material-symbols-outlined") {{tool.icon}}
        button(v-show="mode === tool.mode" :data-tooltip-target="'tooltip-' + index" type="button" class="bg-blue-500 hover:bg-blue-500 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="setMode('none')")
          span(class="material-symbols-outlined") {{tool.icon}}
        div(:id="'tooltip-' + index" role="tooltip" class="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip dark:bg-gray-700") {{ tool.tooltip }}&nbsp;&nbsp;&nbsp;
          span(class="text-slate-400") {{tool.shortcut}}
          div(class="tooltip-arrow" data-popper-arrow)
      //- Undo
      li.flex.mx-2
        button(:data-tooltip-target="'tooltip-undo'" type="button" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded")
          span(class="material-symbols-outlined") undo 
        div(:id="'tooltip-undo'" role="tooltip" class="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip dark:bg-gray-700") Undo&nbsp;&nbsp;&nbsp;
          span(class="text-slate-400") Ctrl + Z
          div(class="tooltip-arrow" data-popper-arrow)
      //- Redo
      li.flex.mx-2
        button(:data-tooltip-target="'tooltip-redo'" type="button" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded")
          span(class="material-symbols-outlined") redo 
        div(:id="'tooltip-redo'" role="tooltip" class="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip dark:bg-gray-700") Redo&nbsp;&nbsp;&nbsp;
          span(class="text-slate-400") Ctrl + Y
          div(class="tooltip-arrow" data-popper-arrow)
</template>
