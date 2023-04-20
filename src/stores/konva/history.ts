/* eslint-disable import/no-cycle */
import { defineStore, storeToRefs } from 'pinia'
import useStoreLine from '@/stores/konva/line'
import useStoreText from '@/stores/konva/text'
import useStoreImage from '@/stores/konva/image'
import useStoreTransformer from '@/stores/konva/transformer'
import type { History } from '@/types/konva'
import _ from 'lodash'

const useStoreHistory = defineStore({
  id: 'history',
  state: () => ({
    historyStep: 0,
    canvasHistory: [{ lines: [], texts: [], images: [] }] as History[],
  }),

  actions: {
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

export default useStoreHistory
