/* eslint-disable import/no-cycle */
import Konva from 'konva'
import { nanoid } from 'nanoid'
import { defineStore } from 'pinia'
import useStoreMode from '@/stores/mode'
import useStoreHistory from '@/stores/konva/history'

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

const useStoreImage = defineStore({
  id: 'image',
  state: () => ({
    dragUrl: '',
    dragUploadedImageId: '',
    konvaImages: [] as KonvaImage[], // canvasの画像の状態（リアルタイム）
    firstKonvaImages: [] as KonvaImage[], // canvas保存前の画像の状態
  }),

  actions: {
    // FirestoreCanvasImageをKonvaImageに変換
    changeFirestoreCanvasImagesToKonvaImages(
      firestoreCanvasImages: FirestoreCanvasImage[],
    ) {
      const konvaImageArray = [] as KonvaImage[]
      firestoreCanvasImages?.forEach(
        (firestoreCanvasImage: FirestoreCanvasImage) => {
          konvaImageArray.push({
            id: firestoreCanvasImage.id,
            imageId: firestoreCanvasImage.imageId,
            name: firestoreCanvasImage.name,
            image: this.changeURLToImageElement(
              firestoreCanvasImage.image,
              firestoreCanvasImage.id,
            ),
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
      const firestoreCanvasImagesArray = [] as FirestoreCanvasImage[]
      konvaImages?.forEach((konvaImage: KonvaImage) => {
        firestoreCanvasImagesArray.push({
          id: konvaImage.id,
          imageId: konvaImage.imageId,
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
    changeURLToImageElement(url: string, id: string): HTMLImageElement {
      const imageObj = new Image()
      imageObj.id = id
      imageObj.src = url
      imageObj.crossOrigin = 'anonymous'
      return imageObj
    },

    // image drag
    setDragImageUrlAndId(e: DragEvent) {
      const img = e.target as HTMLImageElement
      this.dragUrl = img.src
      this.dragUploadedImageId = img.id
    },

    // image drop
    setImagesOnCanvas(e: DragEvent, stageRef: Konva.Stage) {
      e.preventDefault()

      // register event position(dropした位置を取得)
      const stage = stageRef.getStage()
      stage.setPointersPositions(e)
      const relativePointerPosition = stage.getRelativePointerPosition()

      const imageObj = new Image()
      imageObj.id = this.dragUploadedImageId
      imageObj.src = this.dragUrl
      imageObj.crossOrigin = 'anonymous'
      imageObj.onload = () => {
        // 画像のリサイズ
        const originalWidth = imageObj.width
        // widthは100pxに縮小するかそのまま
        imageObj.width = Math.min(originalWidth, 100)
        // 100pxに縮小したらheightも変更する
        if (imageObj.width === 100) {
          imageObj.height = (imageObj.height * 100) / originalWidth
        }

        this.konvaImages = this.konvaImages.concat([
          {
            id: nanoid(),
            imageId: imageObj.id,
            name: 'image',
            image: imageObj,
            x: relativePointerPosition.x - imageObj.width / 2,
            y: relativePointerPosition.y - imageObj.height / 2,
            width: imageObj.width,
            height: imageObj.height,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          },
        ])
      }
      useStoreHistory().handleEventEndSaveHistory()

      // モード終了し、サブメニューを閉じる
      useStoreMode().$reset()
    },

    deleteImages() {
      this.konvaImages = []
    },

    // save image position
    handleImageDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
      const shape = e.target
      const image = this.konvaImages.find((i) => i.id === shape.id())
      if (image !== undefined) {
        image.x = shape.x()
        image.y = shape.y()
      }
      useStoreHistory().handleEventEndSaveHistory()
    },
  },
})

export default useStoreImage
