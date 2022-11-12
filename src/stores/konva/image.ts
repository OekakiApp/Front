import Konva from 'konva'
import { nanoid } from 'nanoid'
import { defineStore } from 'pinia'
import useStoreMode from '@/stores/mode'
// eslint-disable-next-line import/no-cycle
import useStoreStage from '@/stores/konva/stage'

export interface KonvaImage {
  id: string
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
  name: string
  image: string //
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
}

const useStoreImage = defineStore({
  id: 'image',
  state: () => ({
    dragUrl: '',
    konvaImages: [] as KonvaImage[],
  }),

  actions: {
    changeFirestoreCanvasImagesToKonvaImages(
      firestoreCanvasImages: FirestoreCanvasImage[],
    ) {
      console.log('changeFirestoreCanvasImagesToKonvaImages')
      const konvaImageArray = [] as KonvaImage[]
      firestoreCanvasImages?.forEach(
        (firestoreCanvasImage: FirestoreCanvasImage) => {
          konvaImageArray.push({
            id: firestoreCanvasImage.id,
            name: firestoreCanvasImage.name,
            image: this.changeURLToImageElement(firestoreCanvasImage.image),
            x: firestoreCanvasImage.x,
            y: firestoreCanvasImage.y,
            width: firestoreCanvasImage.width,
            height: firestoreCanvasImage.height,
            rotation: firestoreCanvasImage.rotation,
            scaleX: firestoreCanvasImage.scaleX,
            scaleY: firestoreCanvasImage.scaleY,
          })
        },
      )
      return konvaImageArray
    },

    // KonvaImageをFirestoreCanvasImageに変換
    changeKonvaImagesToFirestoreCanvasImages(konvaImages: KonvaImage[]) {
      console.log('changeKonvaImagesToFirestoreCanvasImages')
      const firestoreCanvasImagesArray = [] as FirestoreCanvasImage[]
      konvaImages?.forEach((konvaImage: KonvaImage) => {
        firestoreCanvasImagesArray.push({
          id: konvaImage.id,
          name: konvaImage.name,
          image: konvaImage.image.src,
          x: konvaImage.x,
          y: konvaImage.y,
          width: konvaImage.width,
          height: konvaImage.height,
          rotation: konvaImage.rotation,
          scaleX: konvaImage.scaleX,
          scaleY: konvaImage.scaleY,
        })
      })
      return firestoreCanvasImagesArray
    },

    // image urlをimage elementに変換する
    changeURLToImageElement(url: string): HTMLImageElement {
      const imageElement = new Image()
      imageElement.crossOrigin = 'anonymous'
      imageElement.src = url

      // リサイズ
      const originalWidth = imageElement.width
      // widthは100pxに縮小するかそのまま
      imageElement.width = Math.min(originalWidth, 100)
      // 100pxに縮小したらheightも変更する
      if (imageElement.width === 100) {
        imageElement.height *= 100 / originalWidth
      }
      return imageElement
    },

    // image drag
    setDragUrl(e: DragEvent) {
      const img = e.target as HTMLImageElement
      this.dragUrl = img.src
    },

    // image drop
    setImages(e: DragEvent, stageRef: Konva.Stage) {
      e.preventDefault()
      // register event position
      const stage = stageRef.getStage()
      stage.setPointersPositions(e)

      const newImg = this.changeURLToImageElement(this.dragUrl)

      const id = nanoid()
      const relativePointerPosition = stage.getRelativePointerPosition()
      this.konvaImages = this.konvaImages.concat([
        {
          id,
          name: 'image',
          image: newImg,
          x: relativePointerPosition.x - newImg.width / 2,
          y: relativePointerPosition.y - newImg.height / 2,
          width: newImg.width,
          height: newImg.height,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        },
      ])

      useStoreStage().handleEventEndSaveHistory()

      // モード終了し、サブメニューを閉じる
      useStoreMode().$reset()
    },

    deleteImages() {
      this.konvaImages = []
    },

    // save text position
    handleImageDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
      const shape = e.target
      const text = this.konvaImages.find((i) => i.id === shape.id())
      if (text !== undefined) {
        text.x = shape.x()
        text.y = shape.y()
      }
      useStoreStage().handleEventEndSaveHistory()
    },
  },
})

export default useStoreImage
