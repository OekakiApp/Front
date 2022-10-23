<script setup lang="ts">
import { type Color } from '@/components/SubToolMenu.vue'
import useStoreLine from '@/stores/konva/line'
import { ref } from 'vue'

interface Props {
  color: Color
  index: number
  activeIndex: number
}

interface Emits {
  (e: 'toggle-active', index: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { setLineColor } = useStoreLine()

const colorPicker = ref().value

const handleClick = () => {
  emit('toggle-active', props.index)
}
</script>

<template lang="pug">
//- button
div(v-if="props.color.type === 'color-button'" class="rounded-full w-9 h-9 flex justify-center items-center mx-1" :class="{'active-circle': props.index === props.activeIndex }")
  button(type="button" class="flex justify-center items-center" @click="() => {props.color.onClick();handleClick()}")
    div(class="rounded-full w-7 h-7 m-0 cursor-pointer" :style="props.color.style")
//- color-picker
div(v-else-if="props.color.type === 'color-picker'" class="rounded-full w-9 h-9 flex justify-center items-center mx-1" :class="{'active-circle': props.index === props.activeIndex }")
  button(type="button" class="flex justify-center items-center")
    input(ref="colorPicker" type="color" class="input-color-style" value="#000000" @input="() => {setLineColor(colorPicker.value);handleClick();}")
</template>

<style scoped>
.active-circle {
  border-width: 2px;
  border-color: rgb(147 51 234);
}

.input-color-style {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: transparent;
  width: 2rem;
  height: 2.25rem;
  border: none;
  cursor: pointer;
}

.input-color-style::-webkit-color-swatch {
  border-radius: 50%;
}

.input-color-style::-moz-color-swatch {
  border-radius: 50%;
}
</style>
