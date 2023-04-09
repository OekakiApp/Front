/* eslint-disable import/no-cycle */
import { defineStore, storeToRefs } from 'pinia'
import useStoreLine, { Points } from '@/stores/konva/line'
import useStoreText, { TextNode } from '@/stores/konva/text'
import useStoreImage, { KonvaImage } from '@/stores/konva/image'
import useStoreTransformer from '@/stores/konva/transformer'
import _ from 'lodash'

interface History {
  lines: Points[]
  texts: TextNode[]
  images: KonvaImage[]
}

const useStoreStage = defineStore({
  id: 'stage',
  state: () => ({
    configKonva: {
      size: {
        width: window.innerWidth,
        height: window.innerWidth,
      },
      scale: {
        x: 1,
        y: 1,
      },
    },
    historyStep: 0,
    canvasHistory: [{ lines: [], texts: [], images: [] }] as History[],
  }),

  actions: {
    fitStageIntoParentContainer(container: HTMLDivElement) {
      // Fixed stage size
      const SCENE_BASE_WIDTH = 896
      const SCENE_BASE_HEIGHT = 504

      // Max upscale
      const SCENE_MAX_WIDTH = 1280
      const SCENE_MAX_HEIGHT = 720

      if (container === null) return

      const stageWidth =
        container.offsetWidth % 2 !== 0
          ? container.offsetWidth - 1
          : container.offsetWidth

      this.configKonva.size = {
        width: stageWidth,
        height: (stageWidth * 9) / 16, // aspect-ratio
      }

      const scaleX =
        Math.min(this.configKonva.size.width, SCENE_MAX_WIDTH) /
        SCENE_BASE_WIDTH

      const scaleY =
        Math.min(this.configKonva.size.height, SCENE_MAX_HEIGHT) /
        SCENE_BASE_HEIGHT

      const minRatio = Math.min(scaleX, scaleY)
      this.configKonva.scale = { x: minRatio, y: minRatio }
    },

    handleEventEndSaveHistory() {
      const { lines } = storeToRefs(useStoreLine())
      const { texts } = storeToRefs(useStoreText())
      const { konvaImages } = storeToRefs(useStoreImage())
      // 参照切る
      const copyLines = _.cloneDeep(lines.value)
      const copyTexts = _.cloneDeep(texts.value)
      const copyImages = _.cloneDeep(konvaImages.value)
      this.canvasHistory = this.canvasHistory.slice(0, this.historyStep + 1)
      // 履歴保存
      const history = {
        lines: copyLines,
        texts: copyTexts,
        images: copyImages,
      }
      this.canvasHistory = this.canvasHistory.concat([history])
      this.historyStep += 1
    },

    handleUndo() {
      // これ以上遡れない場合何もしない
      if (this.historyStep === 0) return
      this.historyStep -= 1
      this.canvasUndo(this.historyStep)
      // transformer 解除
      useStoreTransformer().$reset()
    },

    // キャンバス描画のUndo
    canvasUndo(historyStep: number) {
      // 参照切る
      const previous = _.cloneDeep(this.canvasHistory[historyStep])
      // line text image 上書き
      const { lines } = storeToRefs(useStoreLine())
      const { texts } = storeToRefs(useStoreText())
      const { konvaImages } = storeToRefs(useStoreImage())
      lines.value = previous.lines
      texts.value = previous.texts
      konvaImages.value = previous.images
    },

    handleRedo() {
      // 履歴の上限の場合何もしない
      if (this.historyStep === this.canvasHistory.length - 1) return
      this.historyStep += 1
      this.canvasRedo(this.historyStep)
      // transformer 解除
      useStoreTransformer().$reset()
    },

    // キャンバス描画のRedo
    canvasRedo(historyStep: number) {
      // 参照切る
      const next = _.cloneDeep(this.canvasHistory[historyStep])
      // line text image 上書き
      const { lines } = storeToRefs(useStoreLine())
      const { texts } = storeToRefs(useStoreText())
      const { konvaImages } = storeToRefs(useStoreImage())
      lines.value = next.lines
      texts.value = next.texts
      konvaImages.value = next.images
    },
  },
})

export default useStoreStage
