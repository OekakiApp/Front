<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import useStoreText from '@/stores/konva/text'

const { fontFamily } = storeToRefs(useStoreText())
const { setFontFamily, setTextOptionValue } = useStoreText()
const selectedFontFamily = ref()
</script>

<template lang="pug">
div(class="block mr-2") 
  label(for="font-family" class="hidden mb-2 text-sm font-medium text-gray-900 dark:text-gray-400") Font Family
  select(
    id="font-family"
    ref="selectedFontFamily"
    v-model="fontFamily"
    class="block pr-7 py-1 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    @change="() => {setFontFamily(selectedFontFamily.value);setTextOptionValue('fontFamily', selectedFontFamily.value);}")
    option(value="Roboto") Roboto
    option(value="Yomogi") Yomogi
    option(value="Titan One") Titan One
    option(value="Pacifico") Pacifico
  </template>
