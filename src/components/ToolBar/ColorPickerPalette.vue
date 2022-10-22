<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ColorPicker } from 'vue-color-kit'
import 'vue-color-kit/dist/vue-color-kit.css'
import useStoreMode, { type Mode } from '@/stores/mode'
import useStoreLine from '@/stores/konva/line'
import useStoreText from '@/stores/konva/text'
import useStoreColor, { type Color } from '@/stores/color'

const { mode } = storeToRefs(useStoreMode())
const { setLineColor } = useStoreLine()
const { setTextColor, setTextOptionValue } = useStoreText()
const { changeColor } = useStoreColor()
const { color, colorsDefault } = storeToRefs(useStoreColor())

const onchange = (colorObj: Color, currMode: Mode) => {
  changeColor(colorObj)
  // 線の色を変更
  const { r, g, b, a } = colorObj.rgba
  if (currMode === 'pen') setLineColor(`rgba(${r}, ${g}, ${b}, ${a})`)
  else if (currMode === 'text') {
    setTextColor(`rgba(${r}, ${g}, ${b}, ${a})`)
    setTextOptionValue('textFillColor', `rgba(${r}, ${g}, ${b}, ${a})`)
  }
}
</script>

<template lang="pug">

ColorPicker(
  theme="light"
  :color="color"
  :colors-default="colorsDefault"
  :sucker-hide="true"
  @change-color="(colorObj) => onchange(colorObj, mode)")
  
</template>

<style scoped>
.hu-color-picker {
  width: 220px !important;
}
</style>
