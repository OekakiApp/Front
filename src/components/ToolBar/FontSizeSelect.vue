<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import useStoreText from '@/stores/konva/text'

const { fontSize } = storeToRefs(useStoreText())
const { setFontSize, setTextOptionValue } = useStoreText()

const selectedFontSize = ref()
const options = [20, 30, 40, 50, 60]
</script>

<template lang="pug">
div(class="tooltip block mr-2" :data-tip="'Font size'")
  label(for="font-size" class="hidden mb-2 text-sm font-medium text-gray-900 dark:text-gray-300") Font size
  select(
    id="font-size"
    ref="selectedFontSize"
    v-model="fontSize"
    class="block p-1 w-12 text-gray-900 bg-gray-50 rounded-lg border border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required max="100" min="1"
    @change="() => { setFontSize(selectedFontSize.value);setTextOptionValue('fontSize', selectedFontSize.value); }"
    )
    option(v-for="(option, index) in options" :key="index" :value="option") {{ option }}
</template>
