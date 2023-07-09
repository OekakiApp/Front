<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { nanoid } from 'nanoid'
import useStoreCanvas from '@/stores/canvas'

const { canvases } = storeToRefs(useStoreCanvas())
</script>

<template lang="pug">
div(class="my-8 grid gap-4 xl:grid-cols-3 md:grid-cols-2")
  div(class="picture mx-auto")
    router-link(:to="{name: 'Create', params: { canvas_id: nanoid() }}")
      div(class="flex justify-center items-center border-dashed border-2 rounded-lg" style="width: 320px; height: 180px")
        p(class="text-5xl text-gray-400") +
  div(v-for="(canvas, index) of canvases" :key="index" class="picture m-auto")
    router-link(:to="{name: 'Create', params: { canvas_id: index }}")
      div(class="flex items-center")
        img(v-if='canvas.image' :src="canvas.image" class="bg-gray-200 rounded-lg border border-gray-500" style="width: 320px; height: 180px")
        img(v-else class="bg-gray-200 rounded-lg border border-gray-500" style="width: 320px; height: 180px")
      div(class="flex mt-2")  
        div(class="text-midnightBlue pl-2") {{ canvas.name }}
</template>
