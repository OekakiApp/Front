import { defineStore } from 'pinia'

type Tool = 'pen' | 'eraser' | 'none'

interface Points {
  points: number[]
  color: string
  strokeWidth: number
}

const useStoreLine = defineStore({
  id: 'line',
  state: () => ({
    tool: 'none',
    isDrawing: false,
    drawColor: 'black', // default Color
    strokeWidth: 1, // default stroke width
    globalCompositeOperation: 'source-over',
    lines: [] as Points[],
  }),

  actions: {
    setTool(tool: Tool) {
      this.tool = tool
    },

    setColor(selectedColor: string) {
      this.drawColor = selectedColor
    },

    setStrokeWidth(selectedStrokeWidth: string) {
      this.strokeWidth = parseInt(selectedStrokeWidth, 10)
    },

    setGlobalCompositeOperation() {
      this.globalCompositeOperation =
        this.tool === 'eraser' ? 'destination-out' : 'source-over'
    },

    setLines(line: Points) {
      this.lines = [...this.lines, line]
    },

    handleMouseDown(e: any) {
      if (this.tool === 'none') return
      this.isDrawing = true
      const pos = e.target.getStage().getRelativePointerPosition()
      const points = {
        points: [pos.x, pos.y],
        color: this.drawColor,
        strokeWidth: this.strokeWidth,
        globalCompositeOperation: this.globalCompositeOperation,
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
