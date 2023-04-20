<script setup lang="ts">
import { reactive } from 'vue'
import useStoreText from '@/stores/konva/text'
import type { TextAlignmentArray } from '@/types/index'

const { setTextOptionValue, setTextAlign } = useStoreText()

const textAlignmentArray: TextAlignmentArray[] = reactive([
  {
    icon: 'format_align_left',
    tooltip: 'Left',
    onClick: () => {
      setTextOptionValue('textAlign', 'left')
      setTextAlign('left')
    },
  },
  {
    icon: 'format_align_center',
    tooltip: 'Center',
    onClick: () => {
      setTextOptionValue('textAlign', 'center')
      setTextAlign('center')
    },
  },
  {
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
  button(v-for="align of textAlignmentArray" :key="align.icon" :data-tip="align.tooltip" class="tooltip flex items-center hover:bg-slate-300" @click="align.onClick")
    span(class="material-symbols-outlined") {{align.icon}}
</template>
