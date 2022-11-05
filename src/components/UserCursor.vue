<script setup lang="ts">
// import Konva from 'konva'
import { storeToRefs } from 'pinia'
import useStoreMode from '@/stores/mode'
import useStoreLine from '@/stores/konva/line'
import useStorePointer from '@/stores/konva/pointer'

const { mode } = storeToRefs(useStoreMode())
const { drawColor, strokeWidth } = storeToRefs(useStoreLine())
const { isLinePointer, x, y } = storeToRefs(useStorePointer())
</script>

<template lang="pug">
v-circle(
  v-if="mode === 'pen' && isLinePointer"
  :config="{ x: x, y: y, radius: Math.max(strokeWidth/2, 2.5), fill: drawColor, opacity: 0.3}"
  )
v-circle(
  v-else-if="mode === 'eraser' && isLinePointer"
  :config="{ x: x, y: y, radius: Math.max(strokeWidth/2, 2.5), fill: 'gray', opacity: 0.3}"
  )
</template>
