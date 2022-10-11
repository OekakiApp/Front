<script setup lang="ts">
import { type Color } from '../ToolBar.vue'
import useStoreLine from '../../stores/konva/line'

type Props = {
  color: Color
}
const props = defineProps<Props>()
// eslint-disable-next-line vue/no-setup-props-destructure
const { setColor } = useStoreLine()
</script>

<template lang="pug">
button(class="items-center" @click="setColor(color)")
  div(class="rounded-full w-8 h-8 m-1 hover:scale-125" :style="{'background-color': props.color}")
</template>
