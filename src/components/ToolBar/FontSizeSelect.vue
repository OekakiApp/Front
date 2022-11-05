<script setup lang="ts">
import { storeToRefs } from 'pinia'
import useStoreText from '@/stores/konva/text'

const { fontSize } = storeToRefs(useStoreText())
const { setFontSize, setTextOptionValue } = useStoreText()

// font size入力規制 1~100
const checkFontSize = (value: string) => {
  let parsedFontSize = parseInt(value, 10)
  if (Number.isNaN(parsedFontSize)) {
    parsedFontSize = 1
  }
  if (parsedFontSize >= 100) {
    parsedFontSize = 100
  }
  return parsedFontSize.toString()
}

const handleInputFontSize = (e: InputEvent) => {
  const inputElement = e.target as HTMLInputElement
  setFontSize(checkFontSize(inputElement.value))
  setTextOptionValue('fontSize', checkFontSize(inputElement.value))
}
</script>

<template lang="pug">
div(class="tooltip block mr-2" :data-tip="'Font size'")
  label(for="font-size" class="hidden mb-2 text-sm font-medium text-gray-900 dark:text-gray-300") Font size
  input(id="font-size" ref="selectedFontSize" :value="fontSize" type="number" class="block p-1 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required max="100" min="1" @input="(e) => handleInputFontSize(e)")
</template>
