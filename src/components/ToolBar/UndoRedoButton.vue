<script setup lang="ts">
import { reactive } from 'vue'
import useStoreStage from '@/stores/konva/stage'

const { handleUndo, handleRedo } = useStoreStage()

const undoRedoArray = reactive([
  {
    icon: 'undo',
    onClick: () => {
      handleUndo()
    },
  },
  {
    icon: 'redo',
    onClick: () => {
      handleRedo()
    },
  },
])
</script>

<template lang="pug">
li.flex.mx-2(v-for="command of undoRedoArray" :key="command.icon")
  button(type="button" class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="command.onClick")
    span(class="material-symbols-outlined") {{ command.icon }}
</template>
