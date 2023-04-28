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

    // テキストエリアを表示、編集後テキスト追加
    createNewTextNode(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
      const { mode } = storeToRefs(useStoreMode())
      // テキストモードではないまたは、クリックしているのがTextならスキップ
      if (mode.value !== 'text' || e.target.className === 'Text') return
      // get Stage
      const stage = e.target.getStage()
      if (stage === null) return
      // get x, y of Stage テキストを配置する座標
      const point = stage.getRelativePointerPosition()

      // 編集開始
      this.isEditing = true
      // so position of textarea will be the sum of positions above:
      // textareaをcanvas上に乗せるので
      // Stage上でのtextの位置(x, y) + Stageまでの距離(x, y)が必要
      const absolutePoint = stage.getPointerPosition()
      if (absolutePoint === null) return

      const areaAbsolutePosition = {
        x: stage.container().offsetLeft + absolutePoint.x,
        y: stage.container().offsetTop + absolutePoint.y,
      }

      // Textオブジェクトの定義
      const newTextNode = new Konva.Text({
        id: nanoid(),
        text: '',
        rotation: 0,
        x: point.x,
        y: point.y,
        scaleX: 1,
        fontSize: this.fontSize,
        fontStyle: this.fontStyle as FontStyle,
        textDecoration: this.textDecoration as TextDecoration,
        fontFamily: this.fontFamily,
        align: this.align as TextAlign,
        draggable: true,
        width: 200,
        fill: this.fill,
        wrap: 'word',
        ellipsis: false,
        name: 'text',
      })

      // textarea生成
      const newTextarea = this.appendTextarea(
        newTextNode,
        stage,
        areaAbsolutePosition,
      )

      newTextarea.focus()

      newTextarea.addEventListener('blur', () => {
        const trimmedValue =
          this.getStringTrimmedLineFeedFromTextarea(newTextarea)
        // textareaが空ならテキストは追加しない
        if (trimmedValue !== '') {
          this.texts = [
            ...this.texts,
            {
              id: newTextNode.id(),
              text: trimmedValue,
              rotation: Number(newTextarea.style.rotate),
              x: newTextNode.x(),
              y: newTextNode.y(),
              scaleX: 1,
              fontSize: Number(newTextarea.style.fontSize.replace('px', '')),
              fontStyle: newTextarea.style.fontStyle as FontStyle,
              textDecoration: newTextarea.style
                .textDecoration as TextDecoration,
              fontFamily: newTextarea.style.fontFamily.replaceAll('"', ''),
              align: newTextarea.style.textAlign as TextAlign,
              width: 200,
              fill: this.rgbToHex(
                newTextarea.style.color.match(/\d+/g) as RegExpMatchArray,
              ),
              wrap: 'word',
              ellipsis: false,
              name: 'text',
            },
          ]
          useStoreHistory().handleEventEndSaveHistory()
        }
        // textareaを取り除く
        newTextarea.parentNode?.removeChild(newTextarea)
        // 編集終了
        this.isEditing = false
      })
    },

    // Textとtextareaの切り替え
    toggleEdit(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
      const textNode = e.target as Konva.Text
      // 編集開始
      this.isEditing = true
      // reset transformer
      useStoreTransformer().$reset()
      // at first lets find position of text node relative to the stage:
      const textPosition = textNode.absolutePosition() // {x: number,y, number}

      const stage = e.target.getStage()
      // so position of textarea will be the sum of positions above:
      // textareaをcanvas上に乗せるので
      // Stage上でのtextの位置(x, y) + Stageまでの距離(x, y)が必要
      if (stage === null) return
      const areaPosition = {
        x: stage.container().offsetLeft + textPosition.x,
        y: stage.container().offsetTop + textPosition.y,
      }
      // textNodeを非表示
      textNode.hide()

      // テキストエリア生成
      const textarea = this.appendTextarea(textNode, stage, areaPosition)

      textarea.focus()

      textarea.addEventListener('blur', () => {
        const trimmedValue = this.getStringTrimmedLineFeedFromTextarea(textarea)

        const text = this.texts.find((t) => t.id === textNode.id())
        if (text !== undefined) {
          // もしtextareaが空ならテキストを削除する
          if (trimmedValue === '') {
            this.texts = this.texts.filter((t) => t.id !== textNode.id())
          } else {
            text.text = trimmedValue
          }
        }
        // textareaを取り除く
        textarea.parentNode?.removeChild(textarea)
        // TextNodeを再表示
        textNode.show()
        // 編集終了
        this.isEditing = false
        useStoreHistory().handleEventEndSaveHistory()
      })
    },

    appendTextarea(
      textNode: Konva.Text,
      stage: Konva.Stage,
      areaPosition: AreaPosition,
    ) {
      // テキストエリア表示
      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.value = textNode.text()
      textarea.wrap = 'soft'
      textarea.style.position = 'absolute'
      textarea.style.top = `${areaPosition.y}px`
      textarea.style.left = `${areaPosition.x}px`
      textarea.style.width = `${textNode.width()}px`
      textarea.style.fontSize = `${textNode.fontSize()}px`
      textarea.style.background = 'none'
      textarea.style.border = 'none'
      textarea.style.padding = '0px'
      textarea.style.margin = '0px'
      textarea.style.overflow = 'hidden'
      textarea.style.outline = 'none'
      textarea.style.resize = 'none'
      textarea.style.lineHeight = '1'
      textarea.style.fontFamily = textNode.fontFamily()
      textarea.style.transformOrigin = 'left top'
      textarea.style.textAlign = textNode.align()
      textarea.style.color = textNode.fill()
      textarea.style.scale = String(stage.scaleX())
      textarea.spellcheck = false
      const rotation = textNode.rotation()
      let transform = ''
      transform += `rotateZ(${rotation}deg)`
      textarea.style.transform = transform

      textarea.style.height = '0'
      textarea.style.height = `${textarea.scrollHeight}px`

      // textareaのリサイズ
      textarea.addEventListener('input', () => {
        textarea.style.height = '0'
        textarea.style.height = `${textarea.scrollHeight}px`
      })
      return textarea
    },

    // textareaの文字列の先頭と末尾の改行を取り除く
    getStringTrimmedLineFeedFromTextarea(textarea: HTMLTextAreaElement) {
      // 先頭と末尾の改行を削除するための正規表現を定義
      const regex = /^[\n\r]+|[\n\r]+$/g
      // textareaのvalueから先頭と末尾の改行を削除した値を取得
      const trimmedValue = textarea.value.replace(regex, '')
      return trimmedValue
    },

    rgbToHex(rgb: RegExpMatchArray) {
      const [r, g, b] = [...rgb]
      const hexR = Number(r).toString(16).padStart(2, '0').toLocaleUpperCase()
      const hexG = Number(g).toString(16).padStart(2, '0').toLocaleUpperCase()
      const hexB = Number(b).toString(16).padStart(2, '0').toLocaleUpperCase()
      return `#${hexR}${hexG}${hexB}`
    },
  },
})

export default useStoreText
