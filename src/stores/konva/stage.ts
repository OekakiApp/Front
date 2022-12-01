import { defineStore, storeToRefs } from 'pinia'
// eslint-disable-next-line import/no-cycle
import useStoreLine, { Points } from '@/stores/konva/line'
// eslint-disable-next-line import/no-cycle
import useStoreText, { TextNode } from '@/stores/konva/text'
// eslint-disable-next-line import/no-cycle
import useStoreImage, { KonvaImage } from '@/stores/konva/image'
// eslint-disable-next-line import/no-cycle
import useStoreTransformer from '@/stores/konva/transformer'
import _ from 'lodash'
import useStoreUserImage, { UserImageStorage } from '@/stores/userImage'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import useAuthStore from '../auth'

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
    canvasStorageHistory: [{}] as UserImageStorage[],
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
      // StorageHistoryの更新
      this.saveCanvasStorageHistory()
      this.historyStep += 1
    },

    // Storageの履歴を保存していく
    saveCanvasStorageHistory() {
      this.canvasStorageHistory = this.canvasStorageHistory.slice(
        0,
        this.historyStep + 1,
      )
      const { userImageStorage } = storeToRefs(useStoreUserImage())
      // 参照切る
      const copyUserImageStorage = _.cloneDeep(userImageStorage.value)
      this.canvasStorageHistory = this.canvasStorageHistory.concat([
        copyUserImageStorage,
      ])
    },

    async handleUndo() {
      // これ以上遡れない場合何もしない
      if (this.historyStep === 0) return
      this.historyStep -= 1
      this.canvasUndo(this.historyStep)
      await this.storageUndo(this.historyStep)
      // transformer 解除
      const { configShapeTransformer, selectedShapeId } = storeToRefs(
        useStoreTransformer(),
      )
      configShapeTransformer.value.nodes = []
      selectedShapeId.value = ''
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

    // storage状況のUndo
    async storageUndo(historyStep: number) {
      // 参照切る
      const previous = _.cloneDeep(this.canvasStorageHistory[historyStep])
      const { userImageStorage } = storeToRefs(useStoreUserImage())

      // firestore更新
      // ただstoragehistoryをsetするのではなく最新のstorageにhistoryをマージする必要がある。
      // imageのshowの切り替えや画像のアップロードや削除の情報はhistoryに含まれないため
      const { uid } = storeToRefs(useAuthStore())
      const docRef = doc(db, 'userImageStorage', uid.value)
      let currUserImageStorage = _.cloneDeep(userImageStorage.value)
      Object.keys(previous).forEach((imageId) => {
        currUserImageStorage = {
          ...currUserImageStorage,
          [imageId]: {
            ...currUserImageStorage[imageId],
            show: currUserImageStorage[imageId].show,
            canvases: previous[imageId].canvases,
          },
        }
      })

      await updateDoc(docRef, { images: currUserImageStorage })
    },

    async handleRedo() {
      // 履歴の上限の場合何もしない
      if (this.historyStep === this.canvasHistory.length - 1) return
      this.historyStep += 1
      this.canvasRedo(this.historyStep)
      await this.storageRedo(this.historyStep)

      // transformer 解除
      const { configShapeTransformer, selectedShapeId } = storeToRefs(
        useStoreTransformer(),
      )
      configShapeTransformer.value.nodes = []
      selectedShapeId.value = ''
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

    // storage状況のRedo
    async storageRedo(historyStep: number) {
      // 参照切る
      const next = _.cloneDeep(this.canvasStorageHistory[historyStep])
      const { userImageStorage } = storeToRefs(useStoreUserImage())

      // firestore更新
      const { uid } = storeToRefs(useAuthStore())
      const docRef = doc(db, 'userImageStorage', uid.value)
      let currUserImageStorage = _.cloneDeep(userImageStorage.value)
      Object.keys(next).forEach((imageId) => {
        currUserImageStorage = {
          ...currUserImageStorage,
          [imageId]: {
            ...currUserImageStorage[imageId],
            show: currUserImageStorage[imageId].show,
            canvases: next[imageId].canvases,
          },
        }
      })
      await updateDoc(docRef, { images: currUserImageStorage })
    },
  },
})

export default useStoreStage
