<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import useStoreText from '@/stores/konva/text'

const { fontSize } = storeToRefs(useStoreText())
const { setTextOptionValue } = useStoreText()
const selectedFontSize = ref()
</script>

<template lang="pug">
div(class="tooltip block mr-2" :data-tip="'Font size'") 
  label( for="font-size" class="hidden mb-2 text-sm font-medium text-gray-900 dark:text-gray-400") Line style
  select(
    id="font-size"
    ref="selectedFontSize"
    v-model="fontSize"
    class="block pr-7 py-1 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    @change="setTextOptionValue('fontSize', selectedFontSize.value);")
    option(value="10") 10
    option(value="20") 20
    option(value="30") 30
    option(value="40") 40
  </template>
