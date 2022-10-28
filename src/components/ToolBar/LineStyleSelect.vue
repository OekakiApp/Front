<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import useStoreLine from '@/stores/konva/line'

const { lineStyle } = storeToRefs(useStoreLine())
const { setLineStyle } = useStoreLine()
const selectedLineStyle = ref()
</script>

<template lang="pug">
div(class="tooltip block mr-2" :data-tip="'Line style'") 
  label( for="line-style" class="hidden mb-2 text-sm font-medium text-gray-900 dark:text-gray-400") Line style
  select(
    id="line-style"
    ref="selectedLineStyle"
    v-model="lineStyle"
    class="block pr-7 py-1 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    @change="setLineStyle(selectedLineStyle.value)")
    option(value="normal") Normal
    option(value="dash") Dash
  </template>
