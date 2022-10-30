<script setup lang="ts">
import { Color } from '@/types/index'
import { ref } from 'vue'

interface Props {
  color: Color
  index: number
  activeIndex: number
}

interface Emits {
  (e: 'toggle-button-active', index: number): void
  (e: 'toggle-picker-active', index: number, color: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const colorPicker = ref()

const handleColorButtonClick = () => {
  emit('toggle-button-active', props.index)
}

const handleColorPickerClick = (color: string) => {
  emit('toggle-picker-active', props.index, color)
}
</script>

<template lang="pug">
//- button
div(v-if="props.color.type === 'color-button'" class="rounded-full w-9 h-9 flex justify-center items-center mx-0.5" :class="{'active-circle': props.index === props.activeIndex }")
  button(type="button" class="flex justify-center items-center" @click="() => {props.color.onClick();handleColorButtonClick()}")
    div(class="tooltip rounded-full w-7 h-7 m-0 cursor-pointer" :data-tip="props.color.name" :style="props.color.style")
//- color-picker
div(v-else-if="props.color.type === 'color-picker'" class="rounded-full w-9 h-9 flex justify-center items-center mx-0.5" :class="{'active-circle': props.index === props.activeIndex }")
  button(type="button" class="flex justify-center items-center")
    input(ref="colorPicker" type="color" class="tooltip input-color-style" :data-tip="props.color.name" value="#000000" @input="handleColorPickerClick(colorPicker.value)")
</template>

<style scoped>
.active-circle {
  border-width: 2px;
  border-color: rgb(147 51 234);
}

.input-color-style {
  appearance: none;
  background-color: transparent;
  width: 2rem;
  height: 2.25rem;
  border: none;
  cursor: pointer;
  border-radius: 50%;
}

.input-color-style::-webkit-color-swatch {
  border-radius: 50%;
}

.input-color-style::-moz-color-swatch {
  border-radius: 50%;
}
</style>
