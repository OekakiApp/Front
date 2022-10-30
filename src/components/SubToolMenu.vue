<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import LineStyleSelect from '@/components/ToolBar/LineStyleSelect.vue'
import ColorButton from '@/components/ToolBar/ColorButton.vue'
import StrokeWidthRange from '@/components/ToolBar/StrokeWidthRange.vue'
import FontSizeSelect from '@/components/ToolBar/FontSizeSelect.vue'
import FontFamilySelect from '@/components/ToolBar/FontFamilySelect.vue'
import TextAlignmentSelect from '@/components/ToolBar/TextAlignmentSelect.vue'
import useStoreMode from '@/stores/mode'
import useStoreLine from '@/stores/konva/line'
import useStoreText from '@/stores/konva/text'
import { Color } from '@/types/index'
// export type Color = {
//   name: string
//   type: 'color-button' | 'color-picker'
//   color: string
//   style?: {
//     'background-color': string
//   }
//   onClick?: () => void
// }

const { mode } = storeToRefs(useStoreMode())
const { setLineColor } = useStoreLine()
const { setTextOptionValue, setTextColor } = useStoreText()

const activeLineColorIndex = ref<number>(0)
const activeTextColorIndex = ref<number>(0)

const lineColors: Color[] = [
  {
    name: 'Black',
    type: 'color-button',
    color: '#1E1E1E',
    style: { 'background-color': '#1E1E1E' },
    onClick: () => setLineColor('#1E1E1E'),
  },
  {
    name: 'Red',
    type: 'color-button',
    color: '#F24822',
    style: { 'background-color': '#F24822' },
    onClick: () => setLineColor('#F24822'),
  },
  {
    name: 'Orange',
    type: 'color-button',
    color: '#FFA629',
    style: { 'background-color': '#FFA629' },
    onClick: () => setLineColor('#FFA629'),
  },
  {
    name: 'Yellow',
    type: 'color-button',
    color: '#FFCD29',
    style: { 'background-color': '#FFCD29' },
    onClick: () => setLineColor('#FFCD29'),
  },
  {
    name: 'Green',
    type: 'color-button',
    color: '#14AE5C',
    style: { 'background-color': '#14AE5C' },
    onClick: () => setLineColor('#14AE5C'),
  },
  {
    name: 'Blue',
    type: 'color-button',
    color: '#0D99FF',
    style: { 'background-color': '#0D99FF' },
    onClick: () => setLineColor('#0D99FF'),
  },
  {
    name: 'Violet',
    type: 'color-button',
    color: '#9747FF',
    style: { 'background-color': '#9747FF' },
    onClick: () => setLineColor('#9747FF'),
  },
  {
    name: 'White',
    type: 'color-button',
    color: '#FFFFFF',
    style: { 'background-color': '#FFFFFF' },
    onClick: () => setLineColor('#FFFFFF'),
  },
  {
    name: 'Custom',
    type: 'color-picker',
    color: 'rainbow',
  },
]

const textColors: Color[] = [
  {
    name: 'Black',
    type: 'color-button',
    color: '#1E1E1E',
    style: { 'background-color': '#1E1E1E' },
    onClick: () => {
      setTextColor('#1E1E1E')
      setTextOptionValue('textFillColor', '#1E1E1E')
    },
  },
  {
    name: 'Red',
    type: 'color-button',
    color: '#F24822',
    style: { 'background-color': '#F24822' },
    onClick: () => {
      setTextColor('#F24822')
      setTextOptionValue('textFillColor', '#F24822')
    },
  },
  {
    name: 'Orange',
    type: 'color-button',
    color: '#FFA629',
    style: { 'background-color': '#FFA629' },
    onClick: () => {
      setTextColor('#FFA629')
      setTextOptionValue('textFillColor', '#FFA629')
    },
  },
  {
    name: 'Yellow',
    type: 'color-button',
    color: '#FFCD29',
    style: { 'background-color': '#FFCD29' },
    onClick: () => {
      setTextColor('#FFCD29')
      setTextOptionValue('textFillColor', '#FFCD29')
    },
  },
  {
    name: 'Green',
    type: 'color-button',
    color: '#14AE5C',
    style: { 'background-color': '#14AE5C' },
    onClick: () => {
      setTextColor('#14AE5C')
      setTextOptionValue('textFillColor', '#14AE5C')
    },
  },
  {
    name: 'Blue',
    type: 'color-button',
    color: '#0D99FF',
    style: { 'background-color': '#0D99FF' },
    onClick: () => {
      setTextColor('#0D99FF')
      setTextOptionValue('textFillColor', '#0D99FF')
    },
  },
  {
    name: 'Violet',
    type: 'color-button',
    color: '#9747FF',
    style: { 'background-color': '#9747FF' },
    onClick: () => {
      setTextColor('#9747FF')
      setTextOptionValue('textFillColor', '#9747FF')
    },
  },
  {
    name: 'White',
    type: 'color-button',
    color: '#FFFFFF',
    style: { 'background-color': '#FFFFFF' },
    onClick: () => {
      setTextColor('#FFFFFF')
      setTextOptionValue('textFillColor', '#FFFFFF')
    },
  },
  {
    name: 'Custom',
    type: 'color-picker',
    color: 'rainbow',
  },
]
</script>

<template lang="pug">
//- pen
div(v-if="mode === 'pen'" class="flex justify-center items-center bg-gray-200 rounded-lg border border-gray-400 shadow-md pt-2 pb-3 px-2 -mb-2 w-11/12 h-16")
  LineStyleSelect
  ColorButton(
    v-for="(color, index) in lineColors"
    :key="color.color" :color="color" :index="index"
    :active-index="activeLineColorIndex"
    @toggle-button-active="(index:number) => activeLineColorIndex = index"
    @toggle-picker-active="(index:number, color: string) => {activeLineColorIndex = index;setLineColor(color)}")
  div(class="pl-2")
    StrokeWidthRange
//- eraser
div(
  v-else-if="mode === 'eraser'"
  class="flex justify-center items-center bg-gray-200 rounded-lg border border-gray-400 shadow-md pt-2 pb-3 px-2 -mb-2  h-16")
  StrokeWidthRange
//- text
div(v-else-if="mode === 'text'" class="flex justify-center items-center bg-gray-200 rounded-lg border border-gray-400 shadow-md pt-2 pb-3 px-2 -mb-2 w-11/12 h-16")
  FontSizeSelect
  FontFamilySelect
  TextAlignmentSelect
  ColorButton(
    v-for="(color, index) in textColors"
    :key="color.color" :color="color"
    :index="index" :active-index="activeTextColorIndex"
    @toggle-button-active="(index:number) => activeTextColorIndex = index"
    @toggle-picker-active="(index:number, color:string) =>{activeTextColorIndex = index;setTextColor(color);setTextOptionValue('textFillColor', color)}")
</template>
