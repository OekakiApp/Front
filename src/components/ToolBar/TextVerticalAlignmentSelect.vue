<script setup lang="ts">
import useStoreText from '@/stores/konva/text'

const { setTextOptionValue, setTextVerticalAlign } = useStoreText()
</script>

<template lang="pug">
div(class="flex justify-center items-center mx-1") 
  button(class="flex items-center hover:bg-slate-300" @click="setTextOptionValue('textVerticalAlign', 'top');setTextVerticalAlign('top')")
      span(class="material-symbols-outlined") vertical_align_top
  button(class="flex items-center hover:bg-slate-300" @click="setTextOptionValue('textVerticalAlign', 'middle');setTextVerticalAlign('middle')")
      span(class="material-symbols-outlined") vertical_align_center
  button(class="flex items-center hover:bg-slate-300" @click="setTextOptionValue('textVerticalAlign', 'bottom');setTextVerticalAlign('bottom')")
      span(class="material-symbols-outlined") vertical_align_bottom
</template>
