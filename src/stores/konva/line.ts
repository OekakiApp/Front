/* eslint-disable import/no-cycle */
import { defineStore } from 'pinia'
import Konva from 'konva'
import { nanoid } from 'nanoid'
import useStoreMode from '@/stores/mode'
import useStoreHistory from '@/stores/konva/history'
import type { Points, LineStyle, GlobalCompositeOperation } from '@/types/konva'

const useStoreLine = defineStore({
  id: 'line',
  state: () => ({
    lines: [] as Points[], // canvas line
    isDrawing: false,
    drawColor: '#1E1E1E', // default Color
    penStrokeWidth: 1, // default pen stroke width
    eraserStrokeWidth: 1, // default eraser stroke width
    lineStyle: 'normal', // default line style
    dash: [10, 10],
    dashEnabled: false,
    globalCompositeOperation: 'source-over',
    isTouchActive: true,
  }),

  actions: {
    setLineColor(selectedColor: string) {
      this.drawColor = selectedColor
    },

    setPenStrokeWidth(selectedStrokeWidth: string) {
      this.penStrokeWidth = parseInt(selectedStrokeWidth, 10)
    },

    setEraserStrokeWidth(selectedStrokeWidth: string) {
      this.eraserStrokeWidth = parseInt(selectedStrokeWidth, 10)
    },

    setLineStyle(selectedLineStyle: LineStyle) {
      this.dashEnabled = selectedLineStyle !== 'normal'
    },

    setGlobalCompositeOperation(
      globalCompositeOperation: GlobalCompositeOperation,
    ) {
      this.globalCompositeOperation = globalCompositeOperation
    },

    deleteLines() {
      this.lines = []
    },

    toggleIsTouchActive() {
      this.isTouchActive = !this.isTouchActive
    },

    handleLineMouseDown(e: Konva.KonvaEventObject<PointerEvent>) {
      // pencilを使うときはtouchを無効か
      if (!this.isTouchActive && e.evt.pointerType === 'touch') return

      const { mode } = useStoreMode()
      // modeがpenかeraserでないならskip
      if (mode !== 'pen' && mode !== 'eraser') return
      // clickしたのがTextならskip（Textをdragするため）
      if (e.target.getClassName() === 'Text') return

      this.isDrawing = true
      const stage = e.target.getStage()
      if (stage !== null) {
        const pos = stage.getRelativePointerPosition()
        const points = {
          id: nanoid(),
          name: 'line',
          points: [pos.x, pos.y],
          color: this.drawColor,
          strokeWidth:
            mode === 'pen' ? this.penStrokeWidth : this.eraserStrokeWidth,
          dash: this.dash,
          dashEnabled: this.dashEnabled,
          globalCompositeOperation: this.globalCompositeOperation,
        }
        this.lines = [...this.lines, points]
      }
    },

    handleLineMouseMove(e: Konva.KonvaEventObject<PointerEvent>) {
      // no drawing - skipping
      if (!this.isDrawing) {
        return
      }
      // pencilを使うときはtouchを無効化
      if (!this.isTouchActive && e.evt.pointerType === 'touch') return

      // ステージを取得
      const stage = e.target.getStage()
      // ステージのx,yを取得して、座標を追加していく
      if (stage !== null) {
        const point = stage.getRelativePointerPosition()
        const lastLine = this.lines[this.lines.length - 1]
        // add point
        lastLine.points = lastLine.points.concat([point.x, point.y])
        // // replace last
        this.lines.splice(this.lines.length - 1, 1, lastLine)
      }
    },

    handleLineMouseUp(e: Konva.KonvaEventObject<PointerEvent>) {
      // pencilを使うときはtouchを無効化
      if (!this.isTouchActive && e.evt.pointerType === 'touch') return

      const { mode } = useStoreMode()
      // modeがpenかeraserでないならskip
      if (mode !== 'pen' && mode !== 'eraser') return
      this.isDrawing = false
      useStoreHistory().handleEventEndSaveHistory()
    },

    handleLineMouseLeave() {
      // 描画中にキャンバスからマウスが外れたら、描画終了
      if (!this.isDrawing) return
      this.isDrawing = false
      useStoreHistory().handleEventEndSaveHistory()
    },
  },
})

export default useStoreLine
