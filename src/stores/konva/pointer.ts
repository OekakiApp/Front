import Konva from 'konva'
import { defineStore } from 'pinia'
import useStoreMode from '@/stores/mode'
import eraserIcon from '@/assets/eraser.png'

const useStorePointer = defineStore({
  id: 'pointer',
  state: () => ({
    isLinePointer: false,
    x: 0,
    y: 0,
  }),

  actions: {
    // キャンバス上にcursorが入った時
    handlePointerMouseEnter(e: Konva.KonvaEventObject<PointerEvent>) {
      // ポインター種類変更
      const stage = e.target.getStage()
      if (stage === null) return

      const { mode } = useStoreMode()
      // pen pointer
      if (mode === 'pen') {
        this.isLinePointer = true
        stage.container().style.cursor = 'none'
      }
      // eraser pointer
      else if (mode === 'eraser') {
        stage.container().style.cursor = `url(${eraserIcon}) 24 24, auto`
      }
      // text pointer
      else if (mode === 'text') {
        if (e.target.className === 'Text') return
        stage.container().style.cursor = 'pointer'
      }
      // none image pointer
      else if (mode === 'image') {
        stage.container().style.cursor = 'grab'
      }
    },

    // キャンバス上でcursorが動く時
    handlePointerMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
      // ポインターの位置を更新
      const { mode } = useStoreMode()
      if (mode === 'pen') {
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
      const { mode } = useStoreMode()
      if (mode === 'pen') {
        this.isLinePointer = false
      }
      stage.container().style.cursor = 'default'
    },

    // 要素からcursorが離れた時
    handlePointerMouseLeave(e: Konva.KonvaEventObject<MouseEvent>) {
      // ポインター元に戻す
      const { mode } = useStoreMode()
      // skip when pen mode or eraser mode
      if (mode === 'pen' || mode === 'eraser') return

      const stage = e.target.getStage()
      if (stage === null) return
      // text mode
      if (mode === 'text') {
        stage.container().style.cursor = 'pointer'
      }
      // image mode
      else if (mode === 'image') {
        stage.container().style.cursor = 'grab'
      }
      // default
      else {
        stage.container().style.cursor = 'default'
      }
    },

    // 要素にcursorを合わせた時
    handlePointerMouseOver(e: Konva.KonvaEventObject<MouseEvent>) {
      // pen eraser時スキップ
      const { mode } = useStoreMode()
      if (mode === 'pen' || mode === 'eraser') return

      const stage = e.target.getStage()
      if (stage !== null) {
        stage.container().style.cursor = 'grab'
      }
    },

    // 要素のドラッグ時
    handlePointerMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
      // pen eraser時スキップ
      const { mode } = useStoreMode()
      if (mode === 'pen' || mode === 'eraser') return

      const stage = e.target.getStage()
      if (stage !== null) {
        stage.container().style.cursor = 'grabbing'
      }
    },

    // 要素のドラッグ終了時
    handlePointerMouseUp(e: Konva.KonvaEventObject<MouseEvent>) {
      // pen eraser時スキップ
      const { mode } = useStoreMode()
      if (mode === 'pen' || mode === 'eraser') return

      const stage = e.target.getStage()
      if (stage !== null) {
        stage.container().style.cursor = 'grab'
      }
    },
  },
})

export default useStorePointer
