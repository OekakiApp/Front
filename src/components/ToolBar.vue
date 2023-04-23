<script setup lang="ts">
import { ref, reactive, toRefs } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import Konva from 'konva'
import SubToolMenu from '@/components/SubToolMenu.vue'
import UndoRedoButton from '@/components/ToolBar/UndoRedoButton.vue'
import useStoreMode from '@/stores/mode'
import useStoreLine from '@/stores/konva/line'
import useStoreTransformer from '@/stores/konva/transformer'
import useStoreCanvas from '@/stores/canvas'
import type { ToolArray } from '@/types/index'

interface Props {
  stage: Konva.Stage
}

const props = defineProps<Props>()
const { stage } = toRefs(props)

const { mode } = storeToRefs(useStoreMode())
const { setMode } = useStoreMode()
const { setLineStyle, setGlobalCompositeOperation } = useStoreLine()
const { canvases } = storeToRefs(useStoreCanvas())

const canvasId = ref(useRoute().params.canvas_id as string)

// キャンバスをPNGでダウンロード
const downloadImage = async () =>
  new Promise<void>((resolve) => {
    useStoreTransformer().$reset()
    resolve()
  }).then(() => {
    const dataURL = stage.value.getStage().toDataURL({
      quality: 1,
      pixelRatio: 2,
      mimeType: 'image/png',
    })
    const canvasName = canvases.value[canvasId.value].name
    downloadURI(dataURL, `${canvasName}.png`)
  })

const downloadURI = (uri: string, name: string) => {
  const link = document.createElement('a')
  link.download = name
  link.href = uri
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const toolArray: ToolArray[] = reactive([
  {
    icon: 'edit',
    mode: 'pen',
    tooltip: 'Pen',
    shortcut: 'P',
    event: () => {
      setMode('pen')
      setGlobalCompositeOperation('source-over')
      useStoreTransformer().$reset()
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
      setGlobalCompositeOperation('destination-out')
      useStoreTransformer().$reset()
    },
  },
  {
    icon: 'title',
    mode: 'text',
    tooltip: 'Text',
    shortcut: 'T',
    event: () => {
      setMode('text')
      useStoreTransformer().$reset()
    },
  },
  {
    icon: 'image',
    mode: 'image',
    tooltip: 'Image',
    shortcut: 'I',
    event: () => {
      setMode('image')
      useStoreTransformer().$reset()
    },
  },
])
</script>

<template lang="pug">
div(class="flex flex-col items-center relative")
  SubToolMenu
  div(class="flex justify-center items-centers w-full max-w-screen-xl px-4 py-3 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 z-0")
    ul.flex
      //- pen text image
      li(v-for="(tool, index) of toolArray" :key="index" class="flex mx-2")
        button(v-show="mode !== tool.mode" type="button" :data-tip="tool.tooltip + ' : ' + tool.shortcut" class="btn tooltip bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="tool.event")
          span(class="material-symbols-outlined") {{tool.icon}}
        button(v-show="mode === tool.mode" type="button" :data-tip="tool.tooltip + ' : ' + tool.shortcut" class="btn tooltip bg-blue-500 hover:bg-blue-500 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="setMode('none')")
          span(class="material-symbols-outlined") {{tool.icon}}
      //- Undo Redo
      UndoRedoButton
      //- Download
      li.flex.mx-2
        button(type="button" data-tip="Download" class="btn tooltip bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="downloadImage")
          span(class="material-symbols-outlined") file_download
</template>
