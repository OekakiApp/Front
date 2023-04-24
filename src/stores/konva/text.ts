/* eslint-disable import/no-cycle */
import { defineStore, storeToRefs } from 'pinia'
import { nanoid } from 'nanoid'
import Konva from 'konva'
import useStoreMode from '@/stores/mode'
import useStoreHistory from '@/stores/konva/history'
import useStoreTransformer from '@/stores/konva/transformer'
import type {
  FontStyle,
  TextDecoration,
  TextAlign,
  AreaPosition,
  TextNode,
} from '@/types/konva'

// Fontfamily List
export const fontFamilyList = [
  'Roboto',
  'Yomogi',
  'Kiwi Maru',
  'Train One',
  'Dela Gothic One',
]

const useStoreText = defineStore({
  id: 'text',
  state: () => ({
    texts: [] as TextNode[],
    fontSize: 30, // default font size
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    textDecoration: 'empty string',
    fill: '#1E1E1E',
    align: 'left',
    isFontLoaded: false,
    isEditing: false,
  }),

  actions: {
    createNewTextNode(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
      const { mode } = storeToRefs(useStoreMode())
      if (mode.value !== 'text') return
      // クリックしているのが、Textならスキップ
      if (e.target.className === 'Text') return
      // get Stage
      const stage = e.target.getStage()
      if (stage === null) return
      // get x, y of Stage
      const point = stage.getRelativePointerPosition()
      // add text
      this.texts = [
        ...this.texts,
        {
          id: nanoid(),
          text: 'Double click to edit text...',
          rotation: 0,
          x: point.x,
          y: point.y,
          scaleX: 1,
          fontSize: this.fontSize,
          fontStyle: this.fontStyle as FontStyle,
          textDecoration: this.textDecoration as TextDecoration,
          fontFamily: this.fontFamily,
          align: this.align as TextAlign,
          width: 200,
          fill: this.fill,
          wrap: 'word',
          ellipsis: false,
          name: 'text',
        },
      ]
      useStoreHistory().handleEventEndSaveHistory()
    },

    setTextOptionValue(option: string, value: string | TextAlign) {
      const { selectedShapeId } = storeToRefs(useStoreTransformer())
      const text = this.texts.find((t) => t.id === selectedShapeId.value)
      if (text !== undefined) {
        switch (option) {
          case 'fontSize':
            text.fontSize = parseInt(value, 10)
            break
          case 'fontFamily':
            text.fontFamily = value
            break
          case 'textAlign':
            text.align = value as TextAlign
            break
          case 'textFillColor':
            text.fill = value
            break
          default:
            break
        }
        useStoreHistory().handleEventEndSaveHistory()
      }
    },

    setFontSize(selectedFontSize: string) {
      this.fontSize = parseInt(selectedFontSize, 10)
    },

    setFontFamily(selectedFontFamily: string) {
      this.fontFamily = selectedFontFamily
    },

    setTextAlign(selectedTextAlign: TextAlign) {
      this.align = selectedTextAlign
    },

    setTextColor(selectedTextColor: string) {
      this.fill = selectedTextColor
    },

    deleteTexts() {
      this.texts = []
    },

    toggleEdit(
      e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
      transformer: Konva.Transformer,
      stageParentDiv: HTMLDivElement,
    ) {
      const transformerNode = transformer.getNode() as Konva.Transformer
      const textNode = e.target as Konva.Text
      // 編集開始
      this.isEditing = true
      // hide text and transformer
      this.hideTextAndTransformer(textNode, transformerNode)

      // at first lets find position of text node relative to the stage:
      const textPosition = this.findTextNodePosition(textNode) // {x: number,y, number}

      const stage = transformerNode.getStage()
      // so position of textarea will be the sum of positions above:
      // textareaをcanvas上に乗せるので
      // Stage上でのtextの位置(x, y) + Stageまでの距離(x, y)が必要
      if (stage === null) return
      const areaPosition = {
        x: stage.container().offsetLeft + textPosition.x,
        y: stage.container().offsetTop + textPosition.y,
      }
      // create textarea and style it
      this.createTextarea(
        textNode,
        transformerNode,
        areaPosition,
        stageParentDiv,
      )
    },

    hideTextAndTransformer(
      textNode: Konva.Text,
      transformerNode: Konva.Transformer,
    ) {
      textNode.hide()
      transformerNode.hide()
    },

    findTextNodePosition(textNode: Konva.Text) {
      return textNode.absolutePosition()
    },

    createTextarea(
      textNode: Konva.Text,
      transformerNode: Konva.Transformer,
      areaPosition: AreaPosition,
      stageParentDiv: HTMLDivElement,
    ) {
      const textarea = document.createElement('textarea')
      stageParentDiv.appendChild(textarea)
      // apply many styles to match text on canvas as close as possible
      // remember that text rendering on canvas and on the textarea can be different
      // and sometimes it is hard to make it 100% the same. But we will try...
      textarea.value = textNode.text()
      textarea.wrap = 'soft'
      textarea.style.position = 'absolute'
      textarea.style.top = `${areaPosition.y.toString()}px`
      textarea.style.left = `${areaPosition.x.toString()}px`
      textarea.style.width = `${textNode.width() - textNode.padding() * 2}px`
      textarea.style.height = `${
        textNode.height() - textNode.padding() * 2 + 5
      }px`
      textarea.style.fontSize = `${textNode.fontSize()}px`
      textarea.style.border = 'none'
      textarea.style.padding = '0px'
      textarea.style.margin = '0px'
      textarea.style.overflow = 'hidden'
      textarea.style.background = 'none'
      textarea.style.outline = 'none'
      textarea.style.resize = 'none'
      textarea.style.lineHeight = String(textNode.lineHeight())
      textarea.style.fontFamily = textNode.fontFamily()
      textarea.style.transformOrigin = 'left top'
      textarea.style.textAlign = textNode.align()
      textarea.style.color = textNode.fill()
      textarea.style.scale = textNode.getStage()?.scaleX().toString() as string
      textarea.spellcheck = false
      const rotation = textNode.rotation()
      let transform = ''
      transform += `rotateZ(${rotation}deg)`
      textarea.style.transform = transform

      // reset height
      textarea.style.height = 'auto'
      // after browsers resized it we can set actual value
      textarea.style.height = `${textarea.scrollHeight}px`

      textarea.focus()

      textarea.addEventListener('keydown', (e) => {
        const scale = textNode.getAbsoluteScale().x
        textarea.style.width = `${textNode.width() * scale}`
        textarea.style.height = 'auto'
        textarea.style.height = `${
          textarea.scrollHeight + textNode.fontSize()
        }px`
      })

      textarea.addEventListener('blur', () => {
        textNode.text(textarea.value)
        const text = this.texts.find((t) => t.id === textNode.id())
        if (text !== undefined) {
          text.text = textarea.value
        }
        this.removeTextarea(textNode, transformerNode, textarea)
        // 編集終了
        this.isEditing = false
        useStoreHistory().handleEventEndSaveHistory()
      })
    },

    removeTextarea(
      textNode: Konva.Text,
      transformerNode: Konva.Transformer,
      textarea: HTMLTextAreaElement,
    ) {
      textarea.parentNode?.removeChild(textarea)
      textNode.show()
      transformerNode.show()
      transformerNode.forceUpdate()
    },

    // save text position
    handleTextDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
      const shape = e.target
      const text = this.texts.find((t) => t.id === shape.id())
      if (text !== undefined) {
        text.x = shape.x()
        text.y = shape.y()
      }
      useStoreHistory().handleEventEndSaveHistory()
    },
  },
})

export default useStoreText
