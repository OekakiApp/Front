<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import ToolBar from '@/components/ToolBar.vue'
import useStoreMode from '@/stores/mode'
import useStoreStage from '@/stores/konva/stage'
import useStoreLine from '@/stores/konva/line'
import useStoreText from '@/stores/konva/text'
import useStoreImage from '@/stores/konva/image'

const { mode } = storeToRefs(useStoreMode())
const { configKonva } = storeToRefs(useStoreStage())
const { lines } = storeToRefs(useStoreLine())
const { texts, configTransformer } = storeToRefs(useStoreText())
const { konvaImages } = storeToRefs(useStoreImage())

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

const { setImages } = useStoreImage()

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
  div(ref="stageParentDiv" class="bg-white w-full" @drop="(e) => {setImages(e, stage)}" @dragover="(e) => {e.preventDefault();}")
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
        v-rect(:config="{name: 'background-rect', x: 0, y: 0, width: configKonva.size.width / configKonva.scale.x, height: configKonva.size.height / configKonva.scale.y, fill: '#FFFFFF'}")
        v-image(
          v-for="image in konvaImages"
          :key="image.id"
          :draggable="true"
          :config="{image:image.imageElement, x: image.x-image.imageElement.width/2, y: image.y-image.imageElement.height/2}"
        )
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

ToolBar(:stage="stage")
</template>
