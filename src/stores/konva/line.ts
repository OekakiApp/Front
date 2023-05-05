/* eslint-disable import/no-cycle */
import { defineStore } from 'pinia'
import Konva from 'konva'
import { nanoid } from 'nanoid'
import useStoreMode from '@/stores/mode'
import useStoreHistory from '@/stores/konva/history'
import type { Points, LineStyle } from '@/types/konva'

const useStoreLine = defineStore({
  id: 'line',
  state: () => ({
    lines: [] as Points[], // canvas line
    isDrawing: false,
    drawColor: '#1E1E1E', // default Color
    strokeWidth: 1, // default pen stroke width
    lineStyle: 'normal', // default line style
    dash: [10, 10],
    dashEnabled: false,
    isTouchActive: true,
    isDeletedLines: false, // eraserでLineを消したか
  }),

  actions: {
    setLineColor(selectedColor: string) {
      this.drawColor = selectedColor
    },

    setStrokeWidth(selectedStrokeWidth: string) {
      this.strokeWidth = parseInt(selectedStrokeWidth, 10)
    },

    setLineStyle(selectedLineStyle: LineStyle) {
      this.dashEnabled = selectedLineStyle !== 'normal'
    },

    deleteLines() {
      this.lines = []
    },

    toggleIsTouchActive() {
      this.isTouchActive = !this.isTouchActive
    },

    handleLineMouseDown(e: Konva.KonvaEventObject<PointerEvent>) {
      // pencilを使うときはtouchを無効化
      if (!this.isTouchActive && e.evt.pointerType === 'touch') return

      const { mode } = useStoreMode()

      // pen mode
      if (mode === 'pen') {
        // start drawing
        this.isDrawing = true
        // add line point
        const stage = e.target.getStage()
        if (stage !== null) {
          const pos = stage.getRelativePointerPosition()
          const points = {
            id: nanoid(),
            name: 'line',
            points: [pos.x, pos.y],
            color: this.drawColor,
            strokeWidth: this.strokeWidth,
            hitStrokeWidth: this.strokeWidth + 4,
            dash: this.dash,
            dashEnabled: this.dashEnabled,
          }
          this.lines = [...this.lines, points]
        }
      }
      // eraser mode
      else if (mode === 'eraser') {
        // start drawing
        this.isDrawing = true
      }
    },

    handleLineMouseMove(e: Konva.KonvaEventObject<PointerEvent>) {
      // no drawing - skipping
      if (!this.isDrawing) return
      // pencilを使うときはtouchを無効化
      if (!this.isTouchActive && e.evt.pointerType === 'touch') return

      const { mode } = useStoreMode()

      // pen mode
      if (mode === 'pen') {
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
      }
      // eraser mode
      else if (mode === 'eraser') {
        const shape = e.target
        // 触れたLineを削除
        if (shape.getClassName() === 'Line') {
          this.lines = this.lines.filter((l) => l.id !== shape.id())
          // Lineを削除したフラグを立てる
          this.isDeletedLines = true
        }
      }
    },

    handleLineMouseUp(e: Konva.KonvaEventObject<PointerEvent>) {
      // pencilを使うときはtouchを無効化
      if (!this.isTouchActive && e.evt.pointerType === 'touch') return

      const { mode } = useStoreMode()

      // pen mode
      if (mode === 'pen') {
        // save history
        useStoreHistory().handleEventEndSaveHistory()
      }
      // eraser mode
      else if (mode === 'eraser' && this.isDeletedLines) {
        // Lineを削除していたら履歴を保存
        useStoreHistory().handleEventEndSaveHistory()
        this.isDeletedLines = false
      }
      // end drawing
      this.isDrawing = false
    },

    // 描画中にキャンバスからマウスが外れたら終了
    handleLineMouseLeave() {
      // no drawing - skipping
      if (!this.isDrawing) return

      const { mode } = useStoreMode()

      // pen mode
      if (mode === 'pen') {
        useStoreHistory().handleEventEndSaveHistory()
      }
      // eraser mode
      else if (mode === 'eraser' && this.isDeletedLines) {
        // Lineを削除していたら履歴を保存
        useStoreHistory().handleEventEndSaveHistory()
        this.isDeletedLines = false
      }
      // end drawing
      this.isDrawing = false
    },
  },
})

export default useStoreLine
