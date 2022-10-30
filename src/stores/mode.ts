import { defineStore } from 'pinia'
import { Mode } from '@/types/mode'

const useStoreMode = defineStore({
  id: 'mode',
  state: () => ({
    mode: 'none' as Mode, // default
  }),

  actions: {
    setMode(mode: Mode) {
      this.mode = mode
    },
  },
})

export default useStoreMode
