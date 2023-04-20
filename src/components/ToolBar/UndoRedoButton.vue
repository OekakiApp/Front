<script setup lang="ts">
import { reactive } from 'vue'
import useStoreHistory from '@/stores/konva/history'
import type { UndoRedoArray } from '@/types/index'

const { handleUndo, handleRedo } = useStoreHistory()

const undoRedoArray: UndoRedoArray[] = reactive([
  {
    icon: 'undo',
    tooltip: 'Undo : Ctrl + Z',
    onClick: () => {
      handleUndo()
    },
  },
  {
    icon: 'redo',
    tooltip: 'Redo : Ctrl + Y',
    onClick: () => {
      handleRedo()
    },
  },
])
</script>

<template lang="pug">
li.flex.mx-2(v-for="command of undoRedoArray" :key="command.icon")
  button(type="button" :data-tip="command.tooltip" class="btn tooltip bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded" @click="command.onClick")
    span(class="material-symbols-outlined") {{ command.icon }}
</template>
