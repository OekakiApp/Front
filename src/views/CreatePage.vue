<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import ToolBar from '@/components/ToolBar.vue'
import useStoreMode from '@/stores/mode'
import useStoreStage from '@/stores/konva/stage'
import useStoreLine from '@/stores/konva/line'
import useStoreText from '@/stores/konva/text'

const { mode } = storeToRefs(useStoreMode())
const { configKonva } = storeToRefs(useStoreStage())
const { lines } = storeToRefs(useStoreLine())
const { texts, configTransformer } = storeToRefs(useStoreText())

const { setMode } = useStoreMode()
const { fitStageIntoParentContainer } = useStoreStage()
const { handleMouseDown, handleMouseMove, handleMouseUp } = useStoreLine()

const {
  createNewTextNode,
  setTextOptionValue,
  handleStageMouseDown,
  handleTransform,
  handleTransformEnd,
  toggleEdit,
} = useStoreText()

const selectedFontSize = ref()
const selectedFontFamily = ref()
const selectedTextAlign = ref()
const selectedTextVerticalAlign = ref()

const stageParentDiv = ref()
const stage = ref()
const transformer = ref()

// ショートカット
const changeModeByShortCut = (e: KeyboardEvent) => {
  if (e.key === 'h') setMode('hand')
  else if (e.key === 'v') setMode('select')
  else if (e.key === 'p' || e.key === 'm') setMode('pen')
  else if (e.shiftKey && e.key === 'Delete') setMode('eraser')
  else if (e.key === 't') setMode('text')
  else if (e.key === 's') setMode('sticky')
  // open image file
  // undo
  // redo
}

onMounted(() => {
  fitStageIntoParentContainer(stageParentDiv.value)
  window.addEventListener('resize', () =>
    fitStageIntoParentContainer(stageParentDiv.value),
  )
  window.addEventListener('keydown', changeModeByShortCut)
})

onUnmounted(() => {
  window.removeEventListener('resize', () =>
    fitStageIntoParentContainer(stageParentDiv.value),
  )
  window.removeEventListener('keydown', changeModeByShortCut)
})
</script>

<template lang="pug">
div
  label FontSize
  select(ref="selectedFontSize" width=200 @change="setTextOptionValue('fontSize', selectedFontSize.value)")
    option(value="10") 10
    option(value="20") 20
    option(value="30" selected) 30
    option(value="40") 40
div
  label FontFamily
  select(ref="selectedFontFamily" width=200 @change="setTextOptionValue('FontFamily', selectedFontFamily.value)")
    option(value="Arial") Arial
    option(value="cursive") Cursive
    option(value="serif") Serif
div
  label TextAlign
  select(ref="selectedTextAlign" width=200 @change="setTextOptionValue('textAlign', selectedTextAlign.value)")
    option(value="left") Left
    option(value="center") Center
    option(value="right") Right
div
  label TextVerticalAlign
  select(ref="selectedTextVerticalAlign" width=200 @change="setTextOptionValue('textVerticalAlign', selectedTextVerticalAlign.value)")
    option(value="top") Top
    option(value="middle") Middle
    option(value="bottom") Bottom

div(class="m-auto border-4 max-w-screen-xl relative")
  div(ref="stageParentDiv" class="bg-white w-full")
    v-stage(
      ref="stage"
      :draggable="mode === 'hand'"
      :config="configKonva"
      @mousedown="(e) => {handleMouseDown(e, mode);handleStageMouseDown(e, transformer.getNode())}"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @dblclick="(e) => createNewTextNode(e, mode)")
      //- @touchstart="(e:Konva.KonvaEventObject<TouchEvent>) => handleStageMouseDown(e, transformer)"

      v-layer
        v-line(
          v-for="line ,index in lines"
          :key="index"
          :config="{stroke:line.color, points:line.points, strokeWidth:line.strokeWidth, dash: line.dash, dashEnabled: line.dashEnabled, tension:0.1, lineCap:'round', lineJoin:'round', globalCompositeOperation: line.globalCompositeOperation}"
          )
        v-text(
          v-for="text, index in texts"
          :key="index"
          :config="text"
          @transformend="handleTransformEnd"
          @transform="() => handleTransform(transformer.getNode())"
          @dblclick="() => toggleEdit(transformer.getNode(), stageParentDiv)"
          )
        v-transformer(ref="transformer" :config="configTransformer")

  ToolBar 
</template>
