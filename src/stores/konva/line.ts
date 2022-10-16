import { defineStore } from 'pinia'

interface Points {
  points: number[]
  color: string
  strokeWidth: number
}

const useStoreLine = defineStore({
  id: 'line',
  state: () => ({
    drawMode: false,
    isDrawing: false,
    drawColor: 'black', // default Color
    strokeWidth: 1, // default stroke width
    lines: [] as Points[],
  }),

  actions: {
    setColor(selectedColor: string) {
      this.drawColor = selectedColor
    },

    setStrokeWidth(selectedStrokeWidth: string) {
      this.strokeWidth = parseInt(selectedStrokeWidth, 10)
    },

    setLines(line: Points) {
      this.lines = [...this.lines, line]
    },

    handleMouseDown(e: any) {
      if (!this.drawMode) return
      this.isDrawing = true
      const pos = e.target.getStage().getRelativePointerPosition()
      const points = {
        points: [pos.x, pos.y],
        color: this.drawColor,
        strokeWidth: this.strokeWidth,
      }
      this.setLines(points)
    },

    handleMouseMove(e: any) {
      // no drawing - skipping
      if (!this.isDrawing) {
        return
      }
      // ステージを取得
      const stage = e.target.getStage()
      // ステージのx,yを取得
      const point = stage.getRelativePointerPosition()
      const lastLine = this.lines[this.lines.length - 1]
      // add point
      lastLine.points = lastLine.points.concat([point.x, point.y])
      // // replace last
      this.lines.splice(this.lines.length - 1, 1, lastLine)
    },

    handleMouseUp() {
      this.isDrawing = false
    },
  },
})

export default useStoreLine
