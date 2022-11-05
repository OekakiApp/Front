<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import ToolBar from '@/components/ToolBar.vue'
import UserCursor from '@/components/UserCursor.vue'
import useStoreMode from '@/stores/mode'
import useStoreStage from '@/stores/konva/stage'
import useStoreLine from '@/stores/konva/line'
import useStoreText from '@/stores/konva/text'
import useStorePointer from '@/stores/konva/pointer'
import useStoreTransformer from '@/stores/konva/transformer'
import Konva from 'konva'

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
type KonvaEventObject<T> = Konva.KonvaEventObject<T>

const { mode } = storeToRefs(useStoreMode())
const { configKonva } = storeToRefs(useStoreStage())
const { lines } = storeToRefs(useStoreLine())
const { texts, isEditing } = storeToRefs(useStoreText())
const { configShapeTransformer } = storeToRefs(useStoreTransformer())

const { setMode } = useStoreMode()
const { fitStageIntoParentContainer } = useStoreStage()
const {
  handleLineMouseDown,
  handleLineMouseMove,
  handleLineMouseUp,
  handleLineMouseLeave,
  setGlobalCompositeOperation,
} = useStoreLine()

const { createNewTextNode, toggleEdit, handleTextDragEnd } = useStoreText()

const {
  handleMouseDownTransformer,
  handleTransform,
  handleTransformEnd,
  handleKeyDownSelectedNodeDelete,
} = useStoreTransformer()

const {
  handlePointerMouseEnter,
  handlePointerMouseMove,
  handlePointerStageMouseLeave,
  handlePointerMouseLeave,
  handlePointerMouseOver,
  handlePointerMouseDown,
  handlePointerMouseUp,
} = useStorePointer()

const stageParentDiv = ref()
const stage = ref()
const transformer = ref()
// const selectionRectangle = ref()

// ショートカット
const changeModeByShortCut = (e: KeyboardEvent) => {
  // テキスト編集中はショートカット無効
  if (isEditing.value) return
  if (e.key === 'h') setMode('hand')
  else if (e.key === 'v') setMode('select')
  else if (e.key === 'p' || e.key === 'm') {
    setMode('pen')
    setGlobalCompositeOperation()
  } else if (e.shiftKey && e.key === 'Delete') {
    setMode('eraser')
    setGlobalCompositeOperation()
  } else if (e.key === 't') setMode('text')
  else if (e.key === 's') setMode('sticky')
  else if (e.key === 'i') setMode('image')
  // undo
  // redo
}

onMounted(() => {
  fitStageIntoParentContainer(stageParentDiv.value)
  window.addEventListener('resize', () =>
    fitStageIntoParentContainer(stageParentDiv.value),
  )
  window.addEventListener('keydown', (e) => {
    changeModeByShortCut(e)
    handleKeyDownSelectedNodeDelete(e)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', () =>
    fitStageIntoParentContainer(stageParentDiv.value),
  )
  window.removeEventListener('keydown', (e) => {
    changeModeByShortCut(e)
    handleKeyDownSelectedNodeDelete(e)
  })
})
</script>

<template lang="pug">

div(class="m-auto border-4 max-w-screen-xl relative my-8")
  div(ref="stageParentDiv" class="bg-white w-full")
    v-stage(
      ref="stage"
      :draggable="mode === 'hand'"
      :config="configKonva"
      @mouseenter="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseEnter(e);}"
      @mouseleave="(e: KonvaEventObject<MouseEvent>) => {handleLineMouseLeave();handlePointerStageMouseLeave(e);}"
      @mousedown="(e: KonvaEventObject<MouseEvent>) => {handleLineMouseDown(e);handleMouseDownTransformer(e);handlePointerMouseEnter(e);}"
      @mousemove="(e: KonvaEventObject<MouseEvent>) => {handleLineMouseMove(e);handlePointerMouseMove(e);}"
      @mouseup="() => {handleLineMouseUp();}"
      @dblclick="(e: KonvaEventObject<MouseEvent>) => {createNewTextNode(e);}"
      )
      v-layer
        v-rect(:config="{name: 'background-rect', x: 0, y: 0, width: configKonva.size.width / configKonva.scale.x, height: configKonva.size.height / configKonva.scale.y, fill: '#FFFFFF'}")
        v-line(
          v-for="line ,index in lines"
          :key="index"
          :config="{stroke:line.color, points:line.points, strokeWidth:line.strokeWidth, dash: line.dash, dashEnabled: line.dashEnabled, tension:0.1, lineCap:'round', lineJoin:'round', globalCompositeOperation: line.globalCompositeOperation}"
          )
        v-text(
          v-for="text in texts"
          :key="text.id"
          :config="text"
          @dragend="(e: KonvaEventObject<DragEvent>) => handleTextDragEnd(e)"
          @transformend="handleTransformEnd"
          @mouseover="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseOver(e);}"
          @mousedown="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseDown(e);}"
          @mouseup="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseUp(e)}"
          @mouseleave="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseLeave(e);}"
          @transform="(e: KonvaEventObject<MouseEvent>) => handleTransform(e)"
          @dblclick="(e: KonvaEventObject<MouseEvent>) => toggleEdit(e, transformer, stageParentDiv)"
          )
        //- pen eraser時のcursor
        UserCursor
        //- v-rect(
        //- ref="selectionRectangle"
        //- :config="configSelectionRectangle"
        //- )
        v-transformer(ref="transformer" :config="configShapeTransformer")

ToolBar(:stage="stage")
</template>
