import Konva from 'konva'
import { defineStore, storeToRefs } from 'pinia'
import useStoreMode from '@/stores/mode'
import { nanoid } from 'nanoid'
// eslint-disable-next-line import/no-cycle
import useStoreStage from '@/stores/konva/stage'

export interface Points {
  id: string
  name: string
  points: number[]
  color: string
  dash: number[]
  dashEnabled: boolean
  strokeWidth: number
  globalCompositeOperation: string
}

export type LineStyle = 'normal' | 'dash'

export type FontStyle = 'normal' | 'bold' | 'italic' | 'italic bold'
export type TextDecoration = 'empty string' | 'line-through' | 'underline'
export type TextAlign = 'left' | 'center' | 'right'
export type TextVerticalAlign = 'top' | 'middle' | 'bottom'

export interface AreaPosition {
  x: number
  y: number
}

const useStoreLine = defineStore({
  id: 'line',
  state: () => ({
    isDrawing: false,
    drawColor: '#1E1E1E', // default Color
    strokeWidth: 1, // default stroke width
    lineStyle: 'normal', // default line style
    dash: [10, 10],
    dashEnabled: false,
    globalCompositeOperation: 'source-over',
    lines: [] as Points[],
    isTouchActive: true,
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

    setGlobalCompositeOperation() {
      const { mode } = storeToRefs(useStoreMode())
      this.globalCompositeOperation =
        mode.value === 'eraser' ? 'destination-out' : 'source-over'
    },

    setLines(line: Points) {
      this.lines = [...this.lines, line]
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
      const stage = e.target.getStage()
      // clickしたのがTextならskip（Textをdragするため）
      if (e.target.getClassName() === 'Text') return
      this.isDrawing = true
      const id = nanoid()
      if (stage !== null) {
        const pos = stage.getRelativePointerPosition()
        const points = {
          id,
          name: 'line',
          points: [pos.x, pos.y],
          color: this.drawColor,
          strokeWidth: this.strokeWidth,
          dash: this.dash,
          dashEnabled: this.dashEnabled,
          globalCompositeOperation: this.globalCompositeOperation,
        }
        this.setLines(points)
      }
    },

    handleLineMouseMove(e: Konva.KonvaEventObject<PointerEvent>) {
      // no drawing - skipping
      if (!this.isDrawing) {
        return
      }
      // pencilを使うときはtouchを無効か
      if (!this.isTouchActive && e.evt.pointerType === 'touch') return

      // ステージを取得
      const stage = e.target.getStage()
      // ステージのx,yを取得
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
      // pencilを使うときはtouchを無効か
      if (!this.isTouchActive && e.evt.pointerType === 'touch') return

      const { mode } = useStoreMode()
      // modeがpenかeraserでないならskip
      if (mode !== 'pen' && mode !== 'eraser') return
      this.isDrawing = false
      useStoreStage().handleEventEndSaveHistory()
    },

    handleLineMouseLeave() {
      // 描画中にキャンバスからマウスが外れたら、描画終了
      if (!this.isDrawing) return
      this.isDrawing = false
      useStoreStage().handleEventEndSaveHistory()
    },
  },
})

export default useStoreLine
