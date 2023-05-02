// line
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
export type GlobalCompositeOperation = 'source-over' | 'destination-out'

// text
export type FontStyle = 'normal' | 'bold' | 'italic' | 'italic bold'
export type TextDecoration = 'empty string' | 'line-through' | 'underline'
export type TextAlign = 'left' | 'center' | 'right'
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
  fontSize: number
  fontStyle: FontStyle
  textDecoration: TextDecoration
  fontFamily: string
  align: TextAlign
  draggable: boolean
  width: number
  fill: string
  wrap: 'word' | 'char' | 'none'
  ellipsis: boolean
  name: string
}

// image
export interface KonvaImage {
  id: string
  imageId: string
  name: string
  image: HTMLImageElement
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
}
// firestoreにはimage elementを保存できないのでurlだけ保存
export interface FirestoreCanvasImage {
  id: string
  imageId: string
  name: string
  image: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
}

// history
export interface History {
  lines: Points[]
  texts: TextNode[]
  images: KonvaImage[]
}
