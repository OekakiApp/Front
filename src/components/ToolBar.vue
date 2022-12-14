<script setup lang="ts">
import { reactive } from 'vue'
import { storeToRefs } from 'pinia'
import Konva from 'konva'
import useStoreMode, { type Mode } from '@/stores/mode'
import useStoreLine from '@/stores/konva/line'
import useStoreText from '@/stores/konva/text'
import useStoreImage from '@/stores/konva/image'
import useStoreTransformer from '@/stores/konva/transformer'
import useStoreStage from '@/stores/konva/stage'
import SubToolMenu from '@/components/SubToolMenu.vue'
import UndoRedoButton from '@/components/ToolBar/UndoRedoButton.vue'

interface Props {
  stage: Konva.Stage
}

const props = defineProps<Props>()

const { mode } = storeToRefs(useStoreMode())
const { setMode } = useStoreMode()
const { setLineStyle, setGlobalCompositeOperation, deleteLines } =
  useStoreLine()
const { deleteTexts } = useStoreText()
const { deleteImages } = useStoreImage()
const { configShapeTransformer, selectedShapeId } = storeToRefs(
  useStoreTransformer(),
)
const { historyStep, canvasHistory } = storeToRefs(useStoreStage())

const deleteCanvas = () => {
  // delete
  deleteLines()
  deleteTexts()
  deleteImages()

  // reset transformer
  configShapeTransformer.value.nodes = []
  selectedShapeId.value = ''

  // reset history
  historyStep.value = 0
  canvasHistory.value = [{ lines: [], texts: [], images: [] }]
}

const toolArray: {
  icon: string
  mode: Mode
  tooltip: string
  shortcut: string
  event: () => void
}[] = reactive([
  // {
  //   icon: 'navigation',
  //   mode: 'select',
  //   tooltip: 'Select tool',
  //   shortcut: 'V',
  //   event: () => {
  //     setMode('select')
  //   },
  // },
  // {
  //   icon: 'pan_tool',
  //   mode: 'hand',
  //   tooltip: 'Hand tool',
  //   shortcut: 'H',
  //   event: () => {
  //     setMode('hand')
  //   },
  // },
  {
    icon: 'edit',
    mode: 'pen',
    tooltip: 'Pen',
    shortcut: 'P',
    event: () => {
      setMode('pen')
      setGlobalCompositeOperation()
      configShapeTransformer.value.nodes = []
      selectedShapeId.value = ''
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
      setGlobalCompositeOperation()
      configShapeTransformer.value.nodes = []
      selectedShapeId.value = ''
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
  // {
  //   icon: 'sticky_note_2',
  //   mode: 'sticky',
  //   tooltip: 'Sticky note',
  //   shortcut: 'S',
  //   event: () => {
  //     setMode('sticky')
  //   },
  // },
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

const downloadURI = (uri: string, name: string) => {
  const link = document.createElement('a')
  link.download = name
  link.href = uri
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const saveImage = () => {
  // ????????????
  selectedShapeId.value = ''
  configShapeTransformer.value.nodes = []
  // ?????????????????????????????????????????????????????????????????????props.stage????????????????????????????
  const dataURL = props.stage.getStage().toDataURL({
    quality: 1,
    pixelRatio: 2,
  })
  downloadURI(dataURL, 'stage.png')
}
</script>

<template lang="pug">
div(class="flex flex-col items-center relative")
  SubToolMenu
  div(class="flex justify-center items-centers w-full max-w-screen-xl px-4 py-3 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 z-0")
    ul.flex
      //- select hand pen text sticky image
      li(v-for="(tool, index) of toolArray" :key="index" class="flex mx-2")
        button(v-show="mode !== tool.mode" type="button" :data-tip="tool.tooltip + ' : ' + tool.shortcut" class="btn tooltip bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="tool.event")
          span(class="material-symbols-outlined") {{tool.icon}}
        button(v-show="mode === tool.mode" type="button" :data-tip="tool.tooltip + ' : ' + tool.shortcut" class="btn tooltip bg-blue-500 hover:bg-blue-500 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="setMode('none')")
          span(class="material-symbols-outlined") {{tool.icon}}
      //- Undo Redo
      UndoRedoButton
      //- Reset
      li.flex.mx-2
        label(htmlFor="my-modal" data-tip="Reset" class="btn tooltip bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded")
          span(class="material-symbols-outlined") delete
      //- Download
      li.flex.mx-2
        button(type="button" data-tip="Download" class="btn tooltip bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="saveImage")
          span(class="material-symbols-outlined") file_download

input(id="my-modal" type="checkbox" className="modal-toggle")
div(className="modal")
  div(className="modal-box")
    h3(className="font-bold text-2xl") ????????????????????????????????????????????????????????????
    div(class="flex justify-end")
      div(className="modal-action mr-3")
        label(htmlFor="my-modal" className="btn w-36") Cancel
      div(className="modal-action")
        label(htmlFor="my-modal" className="btn w-36 bg-red-500 border-none hover:bg-red-600" @click="deleteCanvas") OK

</template>
