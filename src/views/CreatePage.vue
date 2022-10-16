<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import ToolBar from '../components/ToolBar.vue'
import useStoreStage from '../stores/konva/stage'
import useStoreLine from '../stores/konva/line'
import useStoreText from '../stores/konva/text'

const { configKonva } = storeToRefs(useStoreStage())
const { fitStageIntoParentContainer } = useStoreStage()
const { lines } = storeToRefs(useStoreLine())
const { handleMouseDown, handleMouseMove, handleMouseUp } = useStoreLine()

const { texts, configTransformer } = storeToRefs(useStoreText())
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

const stageParentDiv = ref()
const transformer = ref()

onMounted(() => {
  fitStageIntoParentContainer(stageParentDiv.value)
  window.addEventListener('resize', () =>
    fitStageIntoParentContainer(stageParentDiv.value),
  )
})

onUnmounted(() => {
  window.removeEventListener('resize', () =>
    fitStageIntoParentContainer(stageParentDiv.value),
  )
})
</script>

<template lang="pug">
ToolBar 
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
div(class="flex justify-center items-center p-5 bg-slate-200")
  div(ref="stageParentDiv" class="bg-white max-w-screen-xl w-full")

    v-stage(
      :config="configKonva"
      @mousedown="(e: any) => {handleMouseDown(e);handleStageMouseDown(e, transformer)}"
      @mousemove="(e: any) => handleMouseMove(e)"
      @mouseup="handleMouseUp"
      @dblclick="(e: any) => createNewTextNode(e)")
      //- @touchstart="(e:Konva.KonvaEventObject<TouchEvent>) => handleStageMouseDown(e, transformer)"

      v-layer
        v-line(
          v-for="line ,index in lines"
          :key="index"
          :config="{stroke:line.color,points:line.points,strokeWidth:line.strokeWidth,tension:0.1,lineCap:'round',lineJoin:'round'}"
          )
        v-text(
          v-for="text, index in texts"
          :key="index"
          :config="text"
          @transformend="(e:any) => handleTransformEnd(e)"
          @transform="() => handleTransform(transformer)"
          @dblclick="() => toggleEdit(transformer, stageParentDiv)"
          )
        v-transformer(ref="transformer" :config="configTransformer")

</template>
