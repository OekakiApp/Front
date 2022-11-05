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

const { mode } = storeToRefs(useStoreMode())
const { configKonva } = storeToRefs(useStoreStage())
const { lines } = storeToRefs(useStoreLine())
const { texts, configTransformer } = storeToRefs(useStoreText())

const { setMode } = useStoreMode()
const { fitStageIntoParentContainer } = useStoreStage()
const {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  setGlobalCompositeOperation,
} = useStoreLine()

const {
  createNewTextNode,
  handleStageMouseDown,
  handleTransform,
  handleTransformEnd,
  toggleEdit,
} = useStoreText()

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

// ショートカット
const changeModeByShortCut = (e: KeyboardEvent) => {
  if (e.key === 'h') setMode('hand')
  else if (e.key === 'v') setMode('select')
  else if (e.key === 'p' || e.key === 'm') {
    setMode('pen')
    setGlobalCompositeOperation('pen')
  } else if (e.shiftKey && e.key === 'Delete') {
    setMode('eraser')
    setGlobalCompositeOperation('eraser')
  } else if (e.key === 't') setMode('text')
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

div(class="m-auto border-4 max-w-screen-xl relative my-8")
  div(ref="stageParentDiv" class="bg-white w-full")
    v-stage(
      ref="stage"
      :draggable="mode === 'hand'"
      :config="configKonva"
      @mouseenter="(e) => {handlePointerMouseEnter(e);}"
      @mousedown="(e) => {handleMouseDown(e, mode);handleStageMouseDown(e, transformer.getNode())}"
      @mousemove="(e) => {handleMouseMove(e);handlePointerMouseMove(e);}"
      @mouseup="handleMouseUp"
      @mouseleave="(e) => {handlePointerStageMouseLeave(e);}"
      @dblclick="(e) => createNewTextNode(e, mode)")
      //- @touchstart="(e:Konva.KonvaEventObject<TouchEvent>) => handleStageMouseDown(e, transformer)"

      v-layer
        v-rect(:config="{name: 'background-rect', x: 0, y: 0, width: configKonva.size.width / configKonva.scale.x, height: configKonva.size.height / configKonva.scale.y, fill: '#FFFFFF'}")
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
          @mouseover="(e) => {handlePointerMouseOver(e);}"
          @mousedown="(e) => {handlePointerMouseDown(e);}"
          @mouseup="(e) => {handlePointerMouseUp(e)}"
          @mouseleave="(e) => {handlePointerMouseLeave(e);}"
          @dblclick="() => toggleEdit(transformer.getNode(), stageParentDiv)"
          )
        v-transformer(ref="transformer" :config="configTransformer")
        //- pen eraser時のcursor
        UserCursor

ToolBar(:stage="stage")
</template>
