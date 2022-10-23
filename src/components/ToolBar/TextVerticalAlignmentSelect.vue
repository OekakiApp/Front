<script setup lang="ts">
import useStoreText from '@/stores/konva/text'
import { reactive } from 'vue'

const { setTextOptionValue, setTextVerticalAlign } = useStoreText()

const textVerticalAlignmentArray: { icon: string; onClick: () => void }[] =
  reactive([
    {
      icon: 'vertical_align_top',
      onClick: () => {
        setTextOptionValue('textVerticalAlign', 'top')
        setTextVerticalAlign('top')
      },
    },
    {
      icon: 'vertical_align_center',
      onClick: () => {
        setTextOptionValue('textVerticalAlign', 'middle')
        setTextVerticalAlign('middle')
      },
    },
    {
      icon: 'vertical_align_bottom',
      onClick: () => {
        setTextOptionValue('textVerticalAlign', 'bottom')
        setTextVerticalAlign('bottom')
      },
    },
  ])
</script>

<template lang="pug">
div(class="flex justify-center items-center mx-1") 
  button(v-for="align of textVerticalAlignmentArray" :key="align.icon" class="flex items-center hover:bg-slate-300" @click="align.onClick")
      span(class="material-symbols-outlined") {{ align.icon }}
</template>
