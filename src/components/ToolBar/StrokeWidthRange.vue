<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  strokeWidth: number
  setStrokeWidth: (selectedStrokeWidth: string) => void
}

const props = defineProps<Props>()
const selectedStrokeWidth = ref()
</script>

<template lang="pug">
div(class="tooltip flex items-center" :data-tip="'Stroke width'") 
  label(for="step-range" class="block text-sm font-medium text-gray-900 dark:text-gray-300 text-center") 
  input(
    id="steps-range"
    ref="selectedStrokeWidth"
    :value="props.strokeWidth"
    type="range"
    min="1"
    max="10"
    step="1"
    class="w-28 h-2 bg-gray-400 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
    @change="props.setStrokeWidth(selectedStrokeWidth.value)")
  p(class="ml-1 w-4") {{ strokeWidth }}
</template>
