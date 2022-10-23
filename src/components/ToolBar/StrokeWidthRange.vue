<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import useStoreLine from '@/stores/konva/line'

const { strokeWidth } = storeToRefs(useStoreLine())
const { setStrokeWidth } = useStoreLine()
const selectedStrokeWidth = ref()
</script>

<template lang="pug">
div(class="block") 
  label(for="step-range" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300 text-center") Stroke Width {{ strokeWidth }}
  input(
    id="steps-range"
    ref="selectedStrokeWidth"
    type="range"
    value="1"
    min="1"
    max="10"
    step="1"
    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
    @change="setStrokeWidth(selectedStrokeWidth.value)")
</template>
