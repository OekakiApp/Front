<script setup lang="ts">
import { type Color } from '@/components/ToolBar.vue'

interface Props {
  color: Color
  index: number
  activeindex: number | null
}

interface Emits {
  (e: 'toggle-active', value: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleClick = () => {
  emit('toggle-active', props.index)
}
</script>

<template lang="pug">
div(class="rounded-full w-10 h-10 flex justify-center items-center mx-1" :class="{'active-circle': props.index === props.activeindex }")
  button(class="items-center" @click="() => {props.color.onClick();handleClick()}")
    div(class="rounded-full w-8 h-8 m-0 cursor-pointer" :style="props.color.style")
</template>

<style scoped>
.active-circle {
  border-width: 2px;
  border-color: rgb(147 51 234);
}
</style>
