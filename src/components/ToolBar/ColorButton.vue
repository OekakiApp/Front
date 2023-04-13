<script setup lang="ts">
import { ref, toRefs } from 'vue'
import { type Color } from '@/components/SubToolMenu.vue'

interface Props {
  colors: Color[] // colorリスト全体
  color: Color // btnのcolor
  storeColor: string // storeのcolor
}

interface Emits {
  (e: 'toggle-picker-active', color: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { colors, storeColor } = toRefs(props)
const colorPicker = ref()

const handleColorPickerClick = (color: string) => {
  emit('toggle-picker-active', color)
}
</script>

<template lang="pug">
//- button
div(v-if="props.color.type === 'color-button'" class="rounded-full w-9 h-9 flex justify-center items-center" :class="{'active-circle': props.color.color === storeColor }")
  button(type="button" class="flex justify-center items-center" @click="props.color.onClick()")
    div(class="tooltip rounded-full w-7 h-7 m-0 cursor-pointer" :data-tip="props.color.name" :style="props.color.style")
//- color-picker
div(v-else-if="props.color.type === 'color-picker'" class="rounded-full w-9 h-9 flex justify-center items-center color-picker" :class="{'active-circle': props.color.color === storeColor}")
  button(type="button" class="flex justify-center items-center")
    input(ref="colorPicker" v-model="colors[colors.length - 1].color" type="color" class="tooltip input-color-style" :data-tip="props.color.name" @change="handleColorPickerClick(colorPicker.value)")
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
