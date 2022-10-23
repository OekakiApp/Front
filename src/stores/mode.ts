import { defineStore } from 'pinia'

export type Mode =
  | 'select'
  | 'hand'
  | 'pen'
  | 'eraser'
  | 'text'
  | 'sticky'
  | 'image'
  | 'none'

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
