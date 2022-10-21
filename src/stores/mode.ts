import { defineStore } from 'pinia'

export type Mode = 'hand' | 'pen' | 'eraser' | 'text' | 'image' | 'none'

const useStoreMode = defineStore({
  id: 'mode',
  state: () => ({
    mode: 'none', // default
  }),

  actions: {
    setMode(mode: Mode) {
      this.mode = mode
    },
  },
})

export default useStoreMode
