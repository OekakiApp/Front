export interface Points {
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

export interface TextNode {
  id: string
  text: string
  rotation: number
  x: number
  y: number
  scaleX: number
  scaleY: number
  fontSize: number
  fontStyle: FontStyle
  textDecoration: TextDecoration
  fontFamily: string
  align: TextAlign
  draggable: boolean
  width: number
  height: number
  fill: string
  wrap: 'word' | 'char' | 'none'
  ellipsis: boolean
  name: string
}
