<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import LineStyleSelect from '@/components/ToolBar/LineStyleSelect.vue'
import ColorButton from '@/components/ToolBar/ColorButton.vue'
import StrokeWidthRange from '@/components/ToolBar/StrokeWidthRange.vue'
import FontSizeSelect from '@/components/ToolBar/FontSizeSelect.vue'
import TextAlignmentSelect from '@/components/ToolBar/TextAlignmentSelect.vue'
import TextVerticalAlignmentSelect from '@/components/ToolBar/TextVerticalAlignmentSelect.vue'
import ColorPickerPalette from '@/components/ToolBar/ColorPickerPalette.vue'
import useStoreMode from '@/stores/mode'
import useStoreLine from '@/stores/konva/line'
import useStoreText from '@/stores/konva/text'
import useStoreColor from '@/stores/color'

export type Color = {
  color: string
  style: {
    'background-color'?: string
    background?: string
  }
  onClick: () => void
}

const { mode } = storeToRefs(useStoreMode())
const { drawColor } = storeToRefs(useStoreLine())
const { fill } = storeToRefs(useStoreText())
const { setLineColor } = useStoreLine()
const { setTextOptionValue, setTextColor } = useStoreText()
const { changeToPreparedColor } = useStoreColor()

const linePaletteIsOpen = ref(false)
const textPaletteIsOpen = ref(false)
const activeLineColorIndex = ref<number | null>(null)
const activeTextColorIndex = ref<number | null>(null)

const lineColors: Color[] = [
  {
    color: '#1E1E1E',
    style: { 'background-color': '#1E1E1E' },
    onClick: () => setLineColor('#1E1E1E'),
  },
  {
    color: '#F24822',
    style: { 'background-color': '#F24822' },
    onClick: () => setLineColor('#F24822'),
  },
  {
    color: '#FFA629',
    style: { 'background-color': '#FFA629' },
    onClick: () => setLineColor('#FFA629'),
  },
  {
    color: '#FFCD29',
    style: { 'background-color': '#FFCD29' },
    onClick: () => setLineColor('#FFCD29'),
  },
  {
    color: '#14AE5C',
    style: { 'background-color': '#14AE5C' },
    onClick: () => setLineColor('#14AE5C'),
  },
  {
    color: '#0D99FF',
    style: { 'background-color': '#0D99FF' },
    onClick: () => setLineColor('#0D99FF'),
  },
  {
    color: '#9747FF',
    style: { 'background-color': '#9747FF' },
    onClick: () => setLineColor('#9747FF'),
  },
  {
    color: '#FFFFFF',
    style: { 'background-color': '#FFFFFF' },
    onClick: () => setLineColor('#FFFFFF'),
  },
  {
    color: 'rainbow',
    style: {
      background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
    },
    onClick: () => {
      linePaletteIsOpen.value = !linePaletteIsOpen.value
      // 色をカラーピッカーにも同期させる
      changeToPreparedColor(drawColor.value)
    },
  },
]

const textColors: Color[] = [
  {
    color: '#1E1E1E',
    style: { 'background-color': '#1E1E1E' },
    onClick: () => {
      setTextColor('#1E1E1E')
      setTextOptionValue('textFillColor', '#1E1E1E')
    },
  },
  {
    color: '#F24822',
    style: { 'background-color': '#F24822' },
    onClick: () => {
      setTextColor('#F24822')
      setTextOptionValue('textFillColor', '#F24822')
    },
  },
  {
    color: '#FFA629',
    style: { 'background-color': '#FFA629' },
    onClick: () => {
      setTextColor('#FFA629')
      setTextOptionValue('textFillColor', '#FFA629')
    },
  },
  {
    color: '#FFCD29',
    style: { 'background-color': '#FFCD29' },
    onClick: () => {
      setTextColor('#FFCD29')
      setTextOptionValue('textFillColor', '#FFCD29')
    },
  },
  {
    color: '#14AE5C',
    style: { 'background-color': '#14AE5C' },
    onClick: () => {
      setTextColor('#14AE5C')
      setTextOptionValue('textFillColor', '#14AE5C')
    },
  },
  {
    color: '#0D99FF',
    style: { 'background-color': '#0D99FF' },
    onClick: () => {
      setTextColor('#0D99FF')
      setTextOptionValue('textFillColor', '#0D99FF')
    },
  },
  {
    color: '#9747FF',
    style: { 'background-color': '#9747FF' },
    onClick: () => {
      setTextColor('#9747FF')
      setTextOptionValue('textFillColor', '#9747FF')
    },
  },
  {
    color: '#FFFFFF',
    style: { 'background-color': '#FFFFFF' },
    onClick: () => {
      setTextColor('#FFFFFF')
      setTextOptionValue('textFillColor', '#FFFFFF')
    },
  },
  {
    color: 'rainbow',
    style: {
      background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
    },
    onClick: () => {
      textPaletteIsOpen.value = !textPaletteIsOpen.value
      // 色をカラーピッカーにも同期させる
      changeToPreparedColor(fill.value)
    },
  },
]
</script>

<template lang="pug">
//- pen
div(v-if="mode === 'pen'" class="flex justify-center items-center bg-gray-200 rounded-lg border border-gray-400 shadow-md pt-2 pb-3 px-2 -mb-2 w-11/12")
  LineStyleSelect
  ColorButton(
    v-for="(color, index) in lineColors"
    :key="color.color" :color="color" :index="index"
    :activeindex="activeLineColorIndex"
    @toggle-active="(index:number) => activeLineColorIndex = index")
  div(class="pl-2")
    StrokeWidthRange
  ColorPickerPalette(v-if="linePaletteIsOpen" class="absolute -top-80")
//- eraser
div(
  v-else-if="mode === 'eraser'"
  class="flex justify-center items-center bg-gray-200 rounded-lg border border-gray-400 shadow-md pt-2 pb-3 px-2 -mb-2")
  StrokeWidthRange
//- text
div(v-else-if="mode === 'text'" class="flex justify-center items-center bg-gray-200 rounded-lg border border-gray-400 shadow-md pt-2 pb-3 px-2 -mb-2 w-11/12")
  FontSizeSelect
  TextAlignmentSelect
  TextVerticalAlignmentSelect
  ColorButton(
    v-for="(color, index) in textColors"
    :key="color.color" :color="color"
    :index="index" :activeindex="activeTextColorIndex"
    @toggle-active="(index:number) => activeTextColorIndex = index")
  ColorPickerPalette(v-if="textPaletteIsOpen" class="absolute -top-80")

</template>
