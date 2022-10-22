<script setup lang="ts">
import useStoreText from '@/stores/konva/text'

const { setTextOptionValue, setTextAlign } = useStoreText()
</script>

<template lang="pug">
div(class="flex justify-center items-center mx-1") 
  button(class="flex items-center hover:bg-slate-300" @click="setTextOptionValue('textAlign', 'left');setTextAlign('left')")
    span(class="material-symbols-outlined") format_align_left
  button(class="flex items-center hover:bg-slate-300" @click="setTextOptionValue('textAlign', 'center');setTextAlign('center')")
    span(class="material-symbols-outlined") format_align_center
  button(class="flex items-center hover:bg-slate-300" @click="setTextOptionValue('textAlign', 'right');setTextAlign('right')")
    span(class="material-symbols-outlined") format_align_right
</template>
