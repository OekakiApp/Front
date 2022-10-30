import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'
import Konva from 'konva'
import type { Mode } from '@/stores/mode'
import WebFont from 'webfontloader'

type FontStyle = 'normal' | 'bold' | 'italic' | 'italic bold'
type TextDecoration = 'empty string' | 'line-through' | 'underline'
type TextAlign = 'left' | 'center' | 'right'

interface AreaPosition {
  x: number
  y: number
}

interface TextNode {
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

const useStoreText = defineStore({
  id: 'text',
  state: () => ({
    fontSize: 30, // default font size
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    textDecoration: 'empty string',
    fill: '#1E1E1E',
    align: 'left',
    verticalAlign: 'top',
    texts: [] as TextNode[],
    isFontLoaded: false,

    configTransformer: {
      nodes: [],
      anchorStroke: 'red',
      anchorFill: 'yellow',
      anchorSize: 10,
      borderStroke: 'green',
      borderDash: [3, 3],
      keepRatio: true,
      // set minimum width of text
      boundBoxFunc: (
        oldBox: { width: number; height: number },
        newBox: { width: number; height: number },
      ) => {
        const MIN_WIDTH = 100
        const MIN_HEIGHT = 20
        if (Math.abs(newBox.width) < MIN_WIDTH) return oldBox
        if (Math.abs(newBox.height) < MIN_HEIGHT) return oldBox
        return newBox
      },
    },

    selectedTextName: '',
  }),

  actions: {
    createNewTextNode(e: Konva.KonvaEventObject<MouseEvent>, mode: Mode) {
      if (mode !== 'text') return
      // クリックしているのが、Textならスキップ
      if (e.target.className === 'Text') return
      // get Stage
      const stage = e.target.getStage()
      if (stage === null) return
      // get x, y of Stage
      const point = stage.getRelativePointerPosition()
      // add text
      const id = nanoid()

      if (!this.isFontLoaded) {
        // Webフォント読み込み時のコントロール
        WebFont.load({
          google: {
            families: ['Roboto', 'Yomogi', 'Titan One', 'Pacifico'],
          },
          loading: () => {
            console.log('font is loading')
          },
          // 全てWebフォントの読み込みが完了したときに発火
          active: () => {
            this.isFontLoaded = true
            console.log('fonts is loaded!')
            this.texts = [
              ...this.texts,
              {
                id,
                text: 'Double click to edit text...',
                rotation: 0,
                x: point.x,
                y: point.y,
                scaleX: 1,
                scaleY: 1,
                fontSize: this.fontSize,
                fontStyle: this.fontStyle as FontStyle,
                textDecoration: this.textDecoration as TextDecoration,
                fontFamily: this.fontFamily,
                align: this.align as TextAlign,
                draggable: true,
                width: 200,
                height: 100,
                fill: this.fill,
                wrap: 'word',
                ellipsis: false,
                name: `${id}`,
              },
            ]
          },
        })
      } else {
        this.texts = [
          ...this.texts,
          {
            id,
            text: 'Double click to edit text...',
            rotation: 0,
            x: point.x,
            y: point.y,
            scaleX: 1,
            scaleY: 1,
            fontSize: this.fontSize,
            fontStyle: this.fontStyle as FontStyle,
            textDecoration: this.textDecoration as TextDecoration,
            fontFamily: this.fontFamily,
            align: this.align as TextAlign,
            draggable: true,
            width: 200,
            height: 100,
            fill: this.fill,
            wrap: 'word',
            ellipsis: false,
            name: `${id}`,
          },
        ]
      }
    },

    setTextOptionValue(option: string, value: string | TextAlign) {
      const text = this.texts.find((t) => t.name === this.selectedTextName)
      if (text != null) {
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
      // ノードが選択中の場合、選択を外す
      this.configTransformer.nodes = []
      this.texts = []
    },

    handleTransform(transformer: Konva.Transformer) {
      const selectedNode = transformer
        .getStage()
        ?.findOne(`.${this.selectedTextName}`) as Konva.Text

      const text = this.texts.find((t) => t.name === this.selectedTextName)

      if (text != null) {
        console.log('transforming')
        text.width *= selectedNode.scaleX()
        text.height *= selectedNode.scaleY()
        selectedNode.scaleX(1)
        selectedNode.scaleY(1)
      }
    },

    handleTransformEnd(e: Konva.KonvaEventObject<MouseEvent>) {
      // shape is transformed, let us save new attrs back to the node
      // find element in our state
      const text = this.texts.find((t) => t.name === this.selectedTextName)
      // update the state
      if (text != null) {
        console.log('transformend')
        text.x = e.target.x()
        text.y = e.target.y()
        text.rotation = e.target.rotation()
        text.scaleX = e.target.scaleX()
        text.scaleY = e.target.scaleY()
      }
    },

    handleStageMouseDown(
      e: Konva.KonvaEventObject<MouseEvent>,
      transformer: Konva.Transformer,
    ) {
      // clicked on stage - clear selection
      if (e.target === e.target.getStage()) {
        this.selectedTextName = ''
        // 選択されているnodesを空にする
        this.updateTransformer(transformer)
        return
      }

      // clicked on transformer - do nothing
      const clickedOnTransformer =
        e.target.getParent().className === 'Transformer'
      if (clickedOnTransformer) {
        return
      }

      // find clicked text by its name
      const name = e.target.name()
      const text = this.texts.find((t) => t.name === name)
      if (text != null) {
        this.selectedTextName = name
      } else {
        this.selectedTextName = ''
      }
      this.updateTransformer(transformer)
    },

    updateTransformer(transformer: Konva.Transformer) {
      // here we need to manually attach or detach Transformer node
      const transformerNode = transformer
      const stage = transformerNode.getStage()
      const { selectedTextName } = this

      const selectedNode = stage?.findOne(`.${selectedTextName}`)
      // do nothing if selected node is already attached
      if (selectedNode === transformerNode.nodes()[0]) {
        return
      }

      if (selectedNode !== undefined) {
        // attach to another node
        transformerNode.nodes([selectedNode])
      } else {
        // remove transformer
        transformerNode.nodes([])
      }
    },

    toggleEdit(transformer: Konva.Transformer, stageParentDiv: HTMLDivElement) {
      const transformerNode = transformer
      const stage = transformerNode.getStage() as Konva.Stage
      const textNode = transformer.getNode() as Konva.Text
      // hide text and transformer
      this.hideTextAndTransformer(textNode, transformerNode)
      // at first lets find position of text node relative to the stage:
      const textPosition = this.findTextNodePosition(textNode) // {x: number,y, number}
      // so position of textarea will be the sum of positions above:
      // textareaをcanvas上に乗せるので
      // Stage上でのtextの位置(x, y) + Stageまでの距離(x, y)が必要
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
      textarea.style.position = 'absolute'
      textarea.style.top = `${areaPosition.y}px`
      textarea.style.left = `${areaPosition.x}px`
      textarea.style.width = `${textNode.width() - textNode.padding() * 2}px`
      textarea.style.height = `${textNode.height() - textNode.padding() * 2}px`
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
      let rotation = textNode.rotation()
      let transform = ''
      if (rotation === null) {
        rotation = 0
      }
      transform += `rotateZ(${rotation}deg)`
      textarea.style.transform = transform

      textarea.focus()

      // textarea.addEventListener('keydown', (e) => {
      //   // hide on enter
      //   // but don't hide on shift + enter
      //   if (e.key === 'Enter' && !e.shiftKey) {
      //     textNode.text(textarea.value)
      //     this.removeTextarea(textNode, transformerNode, textarea)
      //   }
      //   // on esc do not set value back to node
      //   if (e.key === 'Escape') {
      //     this.removeTextarea(textNode, transformerNode, textarea)
      //   }
      // })

      // クリックで解除時にエラーが出る
      textarea.addEventListener('blur', () => {
        textNode.text(textarea.value)
        this.removeTextarea(textNode, transformerNode, textarea)
      })

      // setTimeout(() => {
      //   window.addEventListener('click', (e) => {
      //     if (e.target !== textarea) {
      //       textNode.text(textarea.value)
      //       this.removeTextarea(textNode, transformerNode, textarea)
      //     }
      //   })
      // })
    },

    // handleOutsideClick(
    //   e: any,
    //   textNode: Konva.Text,
    //   transformerNode: Konva.Transformer,
    //   textarea: HTMLTextAreaElement,
    // ) {
    //   if (e.target !== textarea) {
    //     textNode.text(textarea.value)
    //     this.removeTextarea(textNode, transformerNode, textarea)
    //   }
    // },

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
  },
})

export default useStoreText
