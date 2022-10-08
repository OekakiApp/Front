<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import router from './router'
import useStoreStage from './stores/konva/stage'
import useStoreLine from './stores/konva/line'
import useStoreText from './stores/konva/text'

const { configKonva } = storeToRefs(useStoreStage())
const { fitStageIntoParentContainer } = useStoreStage()
const { lines } = storeToRefs(useStoreLine())
const {
  setColor,
  setStrokeWidth,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
} = useStoreLine()

const { texts, configTransformer } = storeToRefs(useStoreText())
const {
  createNewTextNode,
  setTextOptionValue,
  handleStageMouseDown,
  handleTransform,
  handleTransformEnd,
  toggleEdit,
} = useStoreText()

const selectedMode = ref()
const selectedColor = ref()
const selectedStrokeWidth = ref()
const selectedFontSize = ref()
const selectedFontFamily = ref()
const selectedTextAlign = ref()

const stageParentDiv = ref()
const transformer = ref()

onMounted(() => {
  window.addEventListener('resize', () =>
    fitStageIntoParentContainer(stageParentDiv.value),
  )
})

onUnmounted(() => {
  window.removeEventListener('resize', () =>
    fitStageIntoParentContainer(stageParentDiv.value),
  )
})

const path = ref('')

router.afterEach((to) => {
  path.value = to.path
})
</script>

<template lang="pug">
nav(class="bg-bleachWhite px-2.sm:px-4 py-2.5 rounded")
  div(class="container flex flex-wrap justify-between items-center mx-auto")
    router-link(to="/")
      h1(class="text-midnightBlue text-xl font-bold") App Name
    div
      ul(class="flex flex-col p-4 mt-4 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0")
        li
          router-link(to="/sign_up" class="text-midnightBlue") 新規登録
        li
          router-link(to="/login" class="text-dustyOrange") ログイン

main(class="container mx-auto px-2 sm:px-4")
  RouterView


div(ref="stageParentDiv" class="p-5")
  div
    label Mode
    select(ref="selectedMode" width=200 @change="setColor(selectedMode.value)")
      option(value="node" selected) None
      option(value="draw") Draw
  div
    label Color
    select(ref="selectedColor" width=200 @change="setColor(selectedColor.value)")
      option(value="black" selected) Black
      option(value="red") Red
      option(value="#dda5f4") Pink
      option(value="#008000") Green
  div
    label StrokeWidth
    select(ref="selectedStrokeWidth" width=200 @change="setStrokeWidth(selectedStrokeWidth.value)")
      option(value="1" selected) 1
      option(value="2") 2
      option(value="3") 3
      option(value="4") 4
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


  v-stage(
    :config="configKonva"
    @mousedown="(e: any) => {handleMouseDown(e, selectedMode.value);handleStageMouseDown(e, transformer)}"
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
