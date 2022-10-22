<script setup lang="ts">
import { type Color } from '@/components/SubToolMenu.vue'

interface Props {
  color: Color
  index: number
  activeIndex: number | null
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
div(class="rounded-full w-9 h-9 flex justify-center items-center mx-1" :class="{'active-circle': props.index === props.activeIndex }")
  button(class="items-center" @click="() => {props.color.onClick();handleClick()}")
    div(class="rounded-full w-7 h-7 m-0 cursor-pointer" :style="props.color.style")
</template>

<style scoped>
.active-circle {
  border-width: 2px;
  border-color: rgb(147 51 234);
}
</style>
