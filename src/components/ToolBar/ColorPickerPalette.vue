<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ColorPicker } from 'vue-color-kit'
import 'vue-color-kit/dist/vue-color-kit.css'
import useStoreColor, { type Color } from '@/stores/color'
import useStoreLine from '@/stores/konva/line'

const { color, colorsDefault } = storeToRefs(useStoreColor())
const { changeColor } = useStoreColor()
const { setColor } = useStoreLine()

const onchange = (colorObj: Color) => {
  changeColor(colorObj)
  // 線の色を変更
  const { r, g, b, a } = colorObj.rgba
  setColor(`rgba(${r}, ${g}, ${b}, ${a})`)
}
</script>

<template lang="pug">

ColorPicker(
  theme="light"
  :color="color"
  :colors-default="colorsDefault"
  :sucker-hide="true"
  @change-color="onchange")

</template>

<style scoped>
.hu-color-picker {
  width: 220px !important;
}
</style>
