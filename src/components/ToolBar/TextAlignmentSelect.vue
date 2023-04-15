<script setup lang="ts">
import { reactive } from 'vue'
import { storeToRefs } from 'pinia'
import useStoreText from '@/stores/konva/text'
import type { TextAlign } from '@/types/konva'

const { align } = storeToRefs(useStoreText())
const { setTextOptionValue, setTextAlign } = useStoreText()

const textAlignmentArray: {
  name: TextAlign
  icon: string
  tooltip: string
  onClick: () => void
}[] = reactive([
  {
    name: 'left',
    icon: 'format_align_left',
    tooltip: 'Left',
    onClick: () => {
      setTextOptionValue('textAlign', 'left')
      setTextAlign('left')
    },
  },
  {
    name: 'center',
    icon: 'format_align_center',
    tooltip: 'Center',
    onClick: () => {
      setTextOptionValue('textAlign', 'center')
      setTextAlign('center')
    },
  },
  {
    name: 'right',
    icon: 'format_align_right',
    tooltip: 'Right',
    onClick: () => {
      setTextOptionValue('textAlign', 'right')
      setTextAlign('right')
    },
  },
])
</script>

<template lang="pug">
div(class="flex justify-center items-center mx-1")
  button(v-for="textAlign of textAlignmentArray" :key="textAlign.icon" :data-tip="textAlign.tooltip" class="tooltip flex items-center" :class="{'bg-gray-400': textAlign.name === align}" @click="textAlign.onClick")
    span(class="material-symbols-outlined") {{textAlign.icon}}
</template>
