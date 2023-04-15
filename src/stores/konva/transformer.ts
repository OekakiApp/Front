/* eslint-disable import/no-cycle */
import Konva from 'konva'
import { defineStore, storeToRefs } from 'pinia'
import useStoreMode from '@/stores/mode'
import useStoreText from '@/stores/konva/text'
import useStoreImage from '@/stores/konva/image'
import useStoreStage from '@/stores/konva/stage'

const useStoreTransformer = defineStore({
  id: 'transformer',
  state: () => ({
    configShapeTransformer: {
      nodes: [] as Konva.Node[],
      anchorStroke: '#0D99FF',
      anchorStrokeWidth: 2,
      anchorFill: '#FFFFFF',
      anchorSize: 10,
      anchorCornerRadius: 3,
      borderStroke: '#0D99FF',
      borderStrokeWidth: 1.5,
      keepRatio: true,
      flipEnabled: false,
      enabledAnchors: [
        'top-left',
        'top-center',
        'top-right',
        'middle-right',
        'middle-left',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
      // shouldOverdrawWholeArea: true,
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

    // configSelectionRectangle: {
    //   fill: 'rgba(51,204,255,0.2)',
    //   visible: false,
    //   width: 0,
    //   height: 0,
    //   x: 0,
    //   y: 0,
    //   x1: 0,
    //   y1: 0,
    //   x2: 0,
    //   y2: 0,
    // },

    selectedShapeId: '',
  }),

  actions: {
    // 複数選択機能のためのコード（今後の拡張のためコメントアウト）

    // // selectionRectangle
    // handleTransformerMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    //   const { mode } = useStoreMode()
    //   if (mode !== 'select') return
    //   // do nothing if we mousedown on any shape
    //   if (e.target.attrs.name !== 'background-rect') return
    //   e.evt.preventDefault()
    //   const stage = e.target.getStage()
    //   if (stage === null) return
    //   const rectStartPointerPosition = stage.getRelativePointerPosition()
    //   if (rectStartPointerPosition !== null) {
    //     this.configSelectionRectangle.x1 = rectStartPointerPosition.x
    //     this.configSelectionRectangle.y1 = rectStartPointerPosition.y
    //     // this.configSelectionRectangle.x2 = rectStartPointerPosition.x
    //     // this.configSelectionRectangle.y2 = rectStartPointerPosition.y
    //   }

    //   this.configSelectionRectangle.visible = true
    //   this.configSelectionRectangle.width = 0
    //   this.configSelectionRectangle.height = 0
    // },

    // handleTransformerMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    //   // do nothing if we didn't start selection
    //   if (!this.configSelectionRectangle.visible) return
    //   const stage = e.target.getStage()
    //   e.evt.preventDefault()
    //   if (stage !== null) {
    //     const CurrPointerPosition = stage.getRelativePointerPosition()
    //     this.configSelectionRectangle.x2 = CurrPointerPosition.x
    //     this.configSelectionRectangle.y2 = CurrPointerPosition.y
    //   }
    //   this.configSelectionRectangle.x = Math.min(
    //     this.configSelectionRectangle.x1,
    //     this.configSelectionRectangle.x2,
    //   )
    //   this.configSelectionRectangle.y = Math.min(
    //     this.configSelectionRectangle.y1,
    //     this.configSelectionRectangle.y2,
    //   )
    //   this.configSelectionRectangle.width = Math.abs(
    //     this.configSelectionRectangle.x2 - this.configSelectionRectangle.x1,
    //   )
    //   this.configSelectionRectangle.height = Math.abs(
    //     this.configSelectionRectangle.y2 - this.configSelectionRectangle.y1,
    //   )
    // },

    // handleTransformerMouseUp(
    //   e: Konva.KonvaEventObject<MouseEvent>,
    //   selectionRectangle: Konva.Rect,
    // ) {
    //   // do nothing if we didn't start selection
    //   if (!this.configSelectionRectangle.visible) {
    //     return
    //   }
    //   e.evt.preventDefault()
    //   // update visibility in timeout, so we can check it in click event
    //   setTimeout(() => {
    //     this.configSelectionRectangle.visible = false
    //   })

    //   const stage = e.target.getStage()
    //   if (stage !== null) {
    //     const shapes = stage.find('.line, .text, .image')
    //     console.log(shapes)
    //     const box = selectionRectangle.getClientRect()
    //     const selected = shapes.filter((shape) =>
    //       Konva.Util.haveIntersection(box, shape.getClientRect()),
    //     )
    //     this.configShapeTransformer.nodes = selected
    //   }
    // },

    // handleTransformerClick(e: Konva.KonvaEventObject<MouseEvent>) {
    //   // if we are selecting with rect, do nothing
    //   if (this.configSelectionRectangle.visible) {
    //     return
    //   }
    //   // if click on empty area - remove all selections
    //   if (e.target.attrs.name === 'background-rect') {
    //     this.configShapeTransformer.nodes = []
    //     return
    //   }

    //   // do nothing if clicked NOT on our rectangles
    //   // if (!e.target.hasName('rect')) {
    //   //   return
    //   // }

    //   // do we pressed shift or ctrl?
    //   const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey
    //   const isSelected = this.configShapeTransformer.nodes.includes(e.target)

    //   if (!metaPressed && !isSelected) {
    //     // if no key pressed and the node is not selected
    //     // select just one
    //     this.configShapeTransformer.nodes = [e.target]
    //     console.log((this.configShapeTransformer.nodes = [e.target]))
    //   } else if (metaPressed && isSelected) {
    //     // if we pressed keys and node was selected
    //     // we need to remove it from selection:
    //     const nodes = this.configShapeTransformer.nodes.slice() // use slice to have new copy of array
    //     // remove node from array
    //     nodes.splice(nodes.indexOf(e.target), 1)
    //     this.configShapeTransformer.nodes = nodes
    //   } else if (metaPressed && !isSelected) {
    //     // add the node into selection
    //     const nodes = this.configShapeTransformer.nodes.concat([e.target])
    //     this.configShapeTransformer.nodes = nodes
    //   }
    // },

    // 要素の取得
    handleMouseDownTransformer(
      e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
    ) {
      // clicked on stage - clear selection
      if (e.target.attrs.name === 'background-rect') {
        // 選択されているnodesを空にする
        this.$reset()
        return
      }

      // clicked on transformer - do nothing
      const clickedOnTransformer =
        e.target.getParent().className === 'Transformer'
      if (clickedOnTransformer) {
        return
      }

      // find clicked shape by its id
      const id = e.target.id()
      const { setMode } = useStoreMode()

      // text
      if (e.target.className === 'Text') {
        // モードを切り替える
        setMode('text')

        // change text transformer anchors
        this.configShapeTransformer.enabledAnchors = [
          'middle-left',
          'middle-right',
        ]

        const { texts, fill, fontSize, fontFamily, align } = storeToRefs(
          useStoreText(),
        )
        const text = texts.value.find((t) => t.id === id)
        if (text !== undefined) {
          this.selectedShapeId = id
          this.configShapeTransformer.nodes = [e.target]
          // 選択したテキストの要素（color fontFamily fontSize align）を取得してツールバーと同期
          fill.value = text.fill
          fontSize.value = text.fontSize
          fontFamily.value = text.fontFamily
          align.value = text.align
        } else {
          this.$reset()
        }
      }
      // image
      else if (e.target.className === 'Image') {
        // モードを切り替える
        setMode('none')
        // change image transformer anchors
        this.configShapeTransformer.enabledAnchors = [
          'top-left',
          'top-right',
          'bottom-left',
          'bottom-right',
        ]

        const { konvaImages } = storeToRefs(useStoreImage())
        const image = konvaImages.value.find((i) => i.id === id)
        if (image !== undefined) {
          this.selectedShapeId = id
          this.configShapeTransformer.nodes = [e.target]
        } else {
          this.$reset()
        }
      }
    },

    // 要素の変形
    handleTransform(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
      const shape = e.target
      // text
      if (shape.name() === 'text') {
        shape.width(shape.width() * shape.scaleX())
        shape.scaleX(1)
        shape.scaleY(1)
      }
      // image
      else if (shape.name() === 'image') {
        shape.width(shape.width() * shape.scaleX())
        shape.height(shape.height() * shape.scaleY())
        shape.scaleX(1)
        shape.scaleY(1)
      }
    },

    // 要素の変形終了
    handleTransformEnd(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
      // shape is transformed, let us save new attrs back to the node
      // find element in our state
      const shape = e.target
      // update the state
      // text
      if (shape.name() === 'text') {
        const { texts } = storeToRefs(useStoreText())
        const text = texts.value.find((t) => t.id === shape.id())
        if (text !== undefined) {
          text.x = shape.x()
          text.y = shape.y()
          text.width = shape.width()
          text.rotation = shape.rotation()
          text.scaleX = shape.scaleX()
        }
      }
      // image
      else if (shape.name() === 'image') {
        const { konvaImages } = storeToRefs(useStoreImage())
        const image = konvaImages.value.find((i) => i.id === shape.id())
        if (image !== undefined) {
          image.x = shape.x()
          image.y = shape.y()
          image.width = shape.width()
          image.height = shape.height()
          image.rotation = shape.rotation()
          image.scaleX = shape.scaleX()
          image.scaleY = shape.scaleY()
        }
      }
      useStoreStage().handleEventEndSaveHistory()
    },

    // keydownで選択中の要素を削除
    async handleKeyDownSelectedNodeDelete(e: KeyboardEvent) {
      if (e.key === 'Delete') {
        if (this.configShapeTransformer.nodes.length === 0) return
        const selectedNode = this.configShapeTransformer.nodes[0]

        // text
        if (selectedNode.name() === 'text') {
          const { texts, isEditing } = storeToRefs(useStoreText())
          // テキスト編集中の場合スキップ
          if (isEditing.value) return
          texts.value = texts.value.filter(
            (text) => text.id !== selectedNode.id(),
          )
          this.$reset()
        }
        // image
        else if (selectedNode.name() === 'image') {
          const { konvaImages } = storeToRefs(useStoreImage())
          // フロント側のキャンバスを更新
          konvaImages.value = konvaImages.value.filter(
            (image) => image.id !== selectedNode.id(),
          )
          this.$reset()
        }
        useStoreStage().handleEventEndSaveHistory()
      }
    },
  },
})

export default useStoreTransformer
