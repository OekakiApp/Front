<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import LineStyleSelect from '@/components/ToolBar/LineStyleSelect.vue'
import ColorButton from '@/components/ToolBar/ColorButton.vue'
import StrokeWidthRange from '@/components/ToolBar/StrokeWidthRange.vue'
import FontSizeSelect from '@/components/ToolBar/FontSizeSelect.vue'
import FontFamilySelect from '@/components/ToolBar/FontFamilySelect.vue'
import TextAlignmentSelect from '@/components/ToolBar/TextAlignmentSelect.vue'
import UserImageList from '@/components/ToolBar/UserImageList.vue'
import useStoreMode from '@/stores/mode'
import useStoreLine from '@/stores/konva/line'
import useStoreText from '@/stores/konva/text'
import type { Color } from '@/types/index'

const { mode } = storeToRefs(useStoreMode())
const { drawColor, penStrokeWidth, eraserStrokeWidth, isTouchActive } =
  storeToRefs(useStoreLine())
const {
  setLineColor,
  setPenStrokeWidth,
  setEraserStrokeWidth,
  toggleIsTouchActive,
} = useStoreLine()
const { fill } = storeToRefs(useStoreText())
const { setTextOptionValue, setTextColor } = useStoreText()

const lineColors: Color[] = reactive([
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
    color: '#000000',
    // 便宜上何も設定しない関数を挿入する
    onClick: () => setLineColor(''),
  },
])

const textColors: Color[] = reactive([
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
    color: '#000000',
    // 便宜上何も設定しない関数を挿入する
    onClick: () => setLineColor(''),
  },
])

// default line colors
const defaultLineColors = computed(() => {
  const defaultList = []
  // eslint-disable-next-line no-restricted-syntax
  for (const color of lineColors) {
    if (color.type === 'color-button') {
      defaultList.push(color.color)
    }
  }
  return defaultList
})
// default text colors
const defaultTextColors = computed(() => {
  const defaultList = []
  // eslint-disable-next-line no-restricted-syntax
  for (const color of textColors) {
    if (color.type === 'color-button') {
      defaultList.push(color.color)
    }
  }
  return defaultList
})

// storeのline colorの変更を監視
watch(drawColor, () => {
  // default colorにない=color pickerによる変更
  // color pickerのcolorプロパティを更新
  if (!defaultLineColors.value.includes(drawColor.value)) {
    lineColors[lineColors.length - 1].color = drawColor.value
  }
})
// storeのtext colorの変更を監視
watch(fill, () => {
  // default colorにない=color pickerによる変更
  // color pickerのcolorプロパティを更新
  if (!defaultTextColors.value.includes(fill.value)) {
    textColors[textColors.length - 1].color = fill.value
  }
})

// pen eraser text style
const subToolbarStyle =
  'flex justify-center items-center bg-gray-200 rounded-lg border border-gray-400 shadow-md pt-2 pb-3 px-2 absolute -top-3/4 h-16'

// image style
const imageSubToolbarStyle =
  'flex justify-center items-center bg-gray-200 rounded-lg border border-gray-400 shadow-md pt-2 pb-6 px-2 absolute bottom-3/4 max-w-screen-sm'
</script>

<template lang="pug">
//- pen
div(v-show="mode === 'pen'" :class="subToolbarStyle")
  LineStyleSelect
  //- Not use Hand
  div(class="px-2")
    button(type="button" data-tip="Touch disabled" class="tooltip flex justify-center items-center w-8 h-8 rounded-full" :class="{'hover:bg-slate-300': isTouchActive, 'bg-slate-300': !isTouchActive}" @click="toggleIsTouchActive")
      span(class="material-symbols-outlined") do_not_touch
  ColorButton(
    v-for="color in lineColors"
    :key="color.name" :color="color"
    :colors="lineColors" :store-color="drawColor" @toggle-picker-active="(color: string) => {setLineColor(color)}")
  div(class="pl-2")
    StrokeWidthRange(:stroke-width="penStrokeWidth" :set-stroke-width="setPenStrokeWidth")
//- eraser
div(v-show="mode === 'eraser'" :class="subToolbarStyle")
  StrokeWidthRange(:stroke-width="eraserStrokeWidth" :set-stroke-width="setEraserStrokeWidth")
//- text
div(v-show="mode === 'text'" :class="subToolbarStyle")
  FontSizeSelect
  FontFamilySelect
  TextAlignmentSelect
  ColorButton(
    v-for="color in textColors"
    :key="color.name" :color="color"
    :colors="textColors"
    :store-color="fill"
    @toggle-picker-active="(color:string) => {setTextColor(color);setTextOptionValue('textFillColor', color)}")
//- image
div(v-show="mode === 'image'" :class="imageSubToolbarStyle")
  UserImageList
</template>
