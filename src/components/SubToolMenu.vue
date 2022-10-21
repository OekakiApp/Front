<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import LineStyleSelect from '@/components/ToolBar/LineStyleSelect.vue'
import ColorButton from '@/components/ToolBar/ColorButton.vue'
import StrokeWidthRange from '@/components/ToolBar/StrokeWidthRange.vue'
import ColorPickerPalette from '@/components/ToolBar/ColorPickerPalette.vue'
import useStoreMode from '@/stores/mode'
import useStoreLine from '@/stores/konva/line'
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
const { setColor } = useStoreLine()
const { changeToPreparedColor } = useStoreColor()

const paletteIsOpen = ref(false)
const activeIndex = ref<number | null>(null)

const colors: Color[] = [
  {
    color: '#1E1E1E',
    style: { 'background-color': '#1E1E1E' },
    onClick: () => setColor('#1E1E1E'),
  },
  {
    color: '#F24822',
    style: { 'background-color': '#F24822' },
    onClick: () => setColor('#F24822'),
  },
  {
    color: '#FFA629',
    style: { 'background-color': '#FFA629' },
    onClick: () => setColor('#FFA629'),
  },
  {
    color: '#FFCD29',
    style: { 'background-color': '#FFCD29' },
    onClick: () => setColor('#FFCD29'),
  },
  {
    color: '#14AE5C',
    style: { 'background-color': '#14AE5C' },
    onClick: () => setColor('#14AE5C'),
  },
  {
    color: '#0D99FF',
    style: { 'background-color': '#0D99FF' },
    onClick: () => setColor('#0D99FF'),
  },
  {
    color: '#9747FF',
    style: { 'background-color': '#9747FF' },
    onClick: () => setColor('#9747FF'),
  },
  {
    color: '#FFFFFF',
    style: { 'background-color': '#FFFFFF' },
    onClick: () => setColor('#FFFFFF'),
  },
  {
    color: 'rainbow',
    style: {
      background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
    },
    onClick: () => {
      paletteIsOpen.value = !paletteIsOpen.value
      // 色をカラーピッカーにも同期させる
      changeToPreparedColor(drawColor.value)
    },
  },
]
</script>

<template lang="pug">
div(v-if="mode === 'pen'" class="flex justify-center items-center bg-gray-200 rounded-lg border border-gray-400 shadow-md py-1 px-2 -mb-1 w-11/12")
  LineStyleSelect
  ColorButton(v-for="(color, index) in colors" :key="color.color" :color="color" :index="index" :activeindex="activeIndex" @toggle-active="(index:number) => activeIndex = index")
  StrokeWidthRange
  ColorPickerPalette(v-if="paletteIsOpen" class="absolute -top-80")
</template>
