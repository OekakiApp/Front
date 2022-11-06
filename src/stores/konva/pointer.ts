import Konva from 'konva'
import { defineStore, storeToRefs } from 'pinia'
import useStoreMode from '@/stores/mode'

const useStorePointer = defineStore({
  id: 'pointer',
  state: () => ({
    isLinePointer: false,
    x: 0,
    y: 0,
  }),

  actions: {
    // キャンバス上にcursorが入った時
    handlePointerMouseEnter(e: Konva.KonvaEventObject<MouseEvent>) {
      // ポインター種類変更
      const stage = e.target.getStage()
      if (stage === null) return

      const { mode } = storeToRefs(useStoreMode())
      if (mode.value === 'pen' || mode.value === 'eraser') {
        this.isLinePointer = true
        stage.container().style.cursor = 'none'
      } else if (mode.value === 'text') {
        if (e.target.className === 'Text') return
        stage.container().style.cursor = 'pointer'
      } else if (mode.value === 'image') {
        //   if (e.target.className === 'Image') return
        stage.container().style.cursor = 'grab'
      }
    },

    // キャンバス上でcursorが動く時
    handlePointerMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
      // ポインターの位置を更新
      const { mode } = storeToRefs(useStoreMode())
      if (mode.value === 'pen' || mode.value === 'eraser') {
        const stage = e.target.getStage()
        if (stage !== null) {
          const pointerPosition = stage.getRelativePointerPosition()
          this.x = pointerPosition.x
          this.y = pointerPosition.y
        }
      }
    },

    // キャンバスからcursorが離れた時
    handlePointerStageMouseLeave(e: Konva.KonvaEventObject<MouseEvent>) {
      // ポインター元に戻す
      const stage = e.target.getStage()
      if (stage === null) return
      const { mode } = storeToRefs(useStoreMode())
      if (mode.value === 'pen' || mode.value === 'eraser') {
        this.isLinePointer = false
      }
      stage.container().style.cursor = 'default'
    },

    // 要素からcursorが離れた時
    handlePointerMouseLeave(e: Konva.KonvaEventObject<MouseEvent>) {
      // ポインター元に戻す
      // pen eraser時スキップ
      const { mode } = storeToRefs(useStoreMode())
      if (mode.value === 'pen' || mode.value === 'eraser') return

      const stage = e.target.getStage()
      if (stage === null) return

      if (mode.value === 'text') {
        stage.container().style.cursor = 'pointer'
      } else if (mode.value === 'image') {
        stage.container().style.cursor = 'grab'
      } else {
        stage.container().style.cursor = 'default'
      }
    },

    // 要素にcursorを合わせた時
    handlePointerMouseOver(e: Konva.KonvaEventObject<MouseEvent>) {
      // pen eraser時スキップ
      const { mode } = storeToRefs(useStoreMode())
      if (mode.value === 'pen' || mode.value === 'eraser') return

      const stage = e.target.getStage()
      if (stage !== null) {
        stage.container().style.cursor = 'grab'
      }
    },

    // 要素のドラッグ時
    handlePointerMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
      // pen eraser時スキップ
      const { mode } = storeToRefs(useStoreMode())
      if (mode.value === 'pen' || mode.value === 'eraser') return

      const stage = e.target.getStage()
      if (stage !== null) {
        stage.container().style.cursor = 'grabbing'
      }
    },

    // 要素のドラッグ終了時
    handlePointerMouseUp(e: Konva.KonvaEventObject<MouseEvent>) {
      // pen eraser時スキップ
      const { mode } = storeToRefs(useStoreMode())
      if (mode.value === 'pen' || mode.value === 'eraser') return

      const stage = e.target.getStage()
      if (stage !== null) {
        stage.container().style.cursor = 'grab'
      }
    },
  },
})

export default useStorePointer
