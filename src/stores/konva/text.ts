import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'
import Konva from 'konva'

type TextAlign = 'left' | 'center' | 'right'

type TextVerticalAlign = 'top' | 'middle' | 'bottom'

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
  fontFamily: string
  align: TextAlign
  verticalAlign: TextVerticalAlign
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
    texts: [] as TextNode[],

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
    createNewTextNode(e: Konva.KonvaEventObject<MouseEvent>) {
      // get Stage
      const stage = e.target.getStage()
      // クリックしているのが、Stageでないならスキップ
      if (e.target !== stage) return
      // get x, y of Stage
      const point = stage.getRelativePointerPosition()
      // add text
      const id = nanoid()
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
          fontSize: 30,
          fontFamily: 'Arial',
          align: 'left',
          verticalAlign: 'top',
          draggable: true,
          width: 200,
          height: 100,
          fill: 'black',
          wrap: 'word',
          ellipsis: true,
          name: `${id}`,
        },
      ]
    },

    setTextOptionValue(
      option: string,
      value: string | TextAlign | TextVerticalAlign,
    ) {
      const text = this.texts.find((t) => t.name === this.selectedTextName)
      if (text != null) {
        switch (option) {
          case 'fontSize':
            this.setFontSize(text, value)
            break
          case 'fontFamily':
            this.setFontFamily(text, value)
            break
          case 'textAlign':
            this.setTextAlign(text, value as TextAlign)
            break
          case 'textVerticalAlign':
            this.setTextVerticalAlign(text, value as TextVerticalAlign)
            break
          default:
            break
        }
      }
    },

    setFontSize(textNode: TextNode, selectedFontSize: string) {
      const text = textNode
      text.fontSize = parseInt(selectedFontSize, 10)
    },

    setFontFamily(textNode: TextNode, selectedFontFamily: string) {
      const text = textNode
      text.fontFamily = selectedFontFamily
    },

    setTextAlign(textNode: TextNode, selectedTextAlign: TextAlign) {
      const text = textNode
      text.align = selectedTextAlign
    },

    setTextVerticalAlign(
      textNode: TextNode,
      selectedTextVerticalAlign: TextVerticalAlign,
    ) {
      const text = textNode
      text.verticalAlign = selectedTextVerticalAlign
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
