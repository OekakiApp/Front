import Konva from 'konva'
import { defineStore } from 'pinia'
import type { Mode } from '@/stores/mode'

interface Points {
  points: number[]
  color: string
  dash: number[]
  dashEnabled: boolean
  strokeWidth: number
}

type LineStyle = 'normal' | 'dash'

const useStoreLine = defineStore({
  id: 'line',
  state: () => ({
    isDrawing: false,
    drawColor: 'black', // default Color
    strokeWidth: 1, // default stroke width
    lineStyle: 'normal', // default line style
    dash: [10, 10],
    dashEnabled: false,
    globalCompositeOperation: 'source-over',
    lines: [] as Points[],
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

    setGlobalCompositeOperation(mode: Mode) {
      this.globalCompositeOperation =
        mode === 'eraser' ? 'destination-out' : 'source-over'
    },

    setLines(line: Points) {
      this.lines = [...this.lines, line]
    },

    handleMouseDown(e: Konva.KonvaEventObject<MouseEvent>, mode: Mode) {
      // modeがpenかeraserでないならskip
      if (mode !== 'pen' && mode !== 'eraser') return
      const stage = e.target.getStage()
      // clickしたのがTextならskip（Textをdragするため）
      if (e.target.getClassName() === 'Text') return
      this.isDrawing = true
      if (stage !== null) {
        const pos = stage.getRelativePointerPosition()
        const points = {
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

    handleMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
      // no drawing - skipping
      if (!this.isDrawing) {
        return
      }
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

    handleMouseUp() {
      this.isDrawing = false
    },
  },
})

export default useStoreLine
