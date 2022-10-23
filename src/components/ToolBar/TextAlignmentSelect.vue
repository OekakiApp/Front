<script setup lang="ts">
import useStoreText from '@/stores/konva/text'
import { reactive } from 'vue'

const { setTextOptionValue, setTextAlign } = useStoreText()

const textAlignmentArray: { icon: string; onClick: () => void }[] = reactive([
  {
    icon: 'format_align_left',
    onClick: () => {
      setTextOptionValue('textAlign', 'left')
      setTextAlign('left')
    },
  },
  {
    icon: 'format_align_center',
    onClick: () => {
      setTextOptionValue('textAlign', 'center')
      setTextAlign('center')
    },
  },
  {
    icon: 'format_align_right',
    onClick: () => {
      setTextOptionValue('textAlign', 'right')
      setTextAlign('right')
    },
  },
])
</script>

<template lang="pug">
div(class="flex justify-center items-center mx-1") 
  button(v-for="align of textAlignmentArray" :key="align.icon" class="flex items-center hover:bg-slate-300" @click="align.onClick")
    span(class="material-symbols-outlined") {{align.icon}}
</template>
