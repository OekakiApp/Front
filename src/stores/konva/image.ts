/* eslint-disable import/no-cycle */
import Konva from 'konva'
import { nanoid } from 'nanoid'
import { defineStore } from 'pinia'
import useStoreMode from '@/stores/mode'
import useStoreHistory from '@/stores/konva/history'
import type { KonvaImage, FirestoreCanvasImage } from '@/types/konva'

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
              firestoreCanvasImage.imageId,
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
    changeURLToImageElement(url: string, imageId: string): HTMLImageElement {
      const imageObj = new Image()
      imageObj.id = imageId
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
        // maxCanvasRatio:キャンバスに対して設定した倍率の大きさの画像を描画できる。
        const maxCanvasRatio = 0.9
        // stage
        const maxImageWidth = (stage.width() / stage.scaleX()) * maxCanvasRatio
        const maxImageHeight =
          (stage.height() / stage.scaleY()) * maxCanvasRatio
        // image
        let imageWidth = imageObj.width
        let imageHeight = imageObj.height

        if (imageWidth > maxImageWidth || imageHeight > maxImageHeight) {
          const ratio = Math.min(
            maxImageWidth / imageWidth,
            maxImageHeight / imageHeight,
          )
          imageWidth *= ratio
          imageHeight *= ratio
        }

        this.konvaImages = this.konvaImages.concat([
          {
            id: nanoid(),
            imageId: imageObj.id,
            name: 'image',
            image: imageObj,
            x: relativePointerPosition.x - imageWidth / 2,
            y: relativePointerPosition.y - imageHeight / 2,
            width: imageWidth,
            height: imageHeight,
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
  },
})

export default useStoreImage
