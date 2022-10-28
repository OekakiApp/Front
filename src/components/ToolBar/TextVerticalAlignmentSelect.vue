<script setup lang="ts">
import useStoreText from '@/stores/konva/text'
import { reactive } from 'vue'

const { setTextOptionValue, setTextVerticalAlign } = useStoreText()

const textVerticalAlignmentArray: { icon: string; onClick: () => void }[] =
  reactive([
    {
      icon: 'vertical_align_top',
      tooltip: 'Top',
      onClick: () => {
        setTextOptionValue('textVerticalAlign', 'top')
        setTextVerticalAlign('top')
      },
    },
    {
      icon: 'vertical_align_center',
      tooltip: 'Middle',
      onClick: () => {
        setTextOptionValue('textVerticalAlign', 'middle')
        setTextVerticalAlign('middle')
      },
    },
    {
      icon: 'vertical_align_bottom',
      tooltip: 'Bottom',
      onClick: () => {
        setTextOptionValue('textVerticalAlign', 'bottom')
        setTextVerticalAlign('bottom')
      },
    },
  ])
</script>

<template lang="pug">
div(class="flex justify-center items-center mx-1")
  button(v-for="align of textVerticalAlignmentArray" :key="align.icon" :data-tip="align.tooltip" class="tooltip flex items-center hover:bg-slate-300" @click="align.onClick")
      span(class="material-symbols-outlined") {{ align.icon }}
</template>
