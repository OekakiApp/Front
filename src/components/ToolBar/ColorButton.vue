<script setup lang="ts">
import { type Color } from '../ToolBar.vue'
import useStoreLine from '../../stores/konva/line'

type Props = {
  color: Color
}
const props = defineProps<Props>()

const { setColor } = useStoreLine()
</script>

<template lang="pug">
div
  button(class="bg-teal-200" @click="setColor(props.color)" )
    span(class="material-symbols-outlined") circle
    p {{props.color}}
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48;
  color: red;
  font-size: 50px;
}
</style>
