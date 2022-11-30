import Konva from 'konva'
import { nanoid } from 'nanoid'
import { defineStore, storeToRefs } from 'pinia'
import useStoreMode from '@/stores/mode'
// eslint-disable-next-line import/no-cycle
import useStoreStage from '@/stores/konva/stage'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import useAuthStore from '@/stores/auth'
import type { UploadedImage } from '@/stores/userImage'

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
    konvaImages: [] as KonvaImage[],
  }),

  actions: {
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
      console.log('changeKonvaImagesToFirestoreCanvasImages')
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
      // corsエラー回避のためanonymousにするとなぜかwidthとheightが0になるため
      // originを生成し、widthとheightを取得しています。
      const origin = new Image()
      origin.src = url
      // キャンバスに乗せる方のimage element
      const imageElement = new Image()
      imageElement.crossOrigin = 'anonymous'
      imageElement.src = url
      imageElement.id = id

      // リサイズ
      const originalWidth = origin.width
      // widthは100pxに縮小するかそのまま
      imageElement.width = Math.min(originalWidth, 100)
      // 100pxに縮小したらheightも変更する
      if (imageElement.width === 100) {
        imageElement.height = (origin.height * 100) / originalWidth
      }
      return imageElement
    },

    // image drag
    setDragUrl(e: DragEvent) {
      const img = e.target as HTMLImageElement
      this.dragUrl = img.src
      this.dragUploadedImageId = img.id
    },

    // image drop
    async setImages(
      e: DragEvent,
      stageRef: Konva.Stage,
      canvasId: string | string[],
    ) {
      e.preventDefault()
      // register event position
      const stage = stageRef.getStage()
      stage.setPointersPositions(e)

      const newImg = this.changeURLToImageElement(
        this.dragUrl,
        this.dragUploadedImageId,
      )

      const id = nanoid()
      const relativePointerPosition = stage.getRelativePointerPosition()
      this.konvaImages = this.konvaImages.concat([
        {
          id,
          imageId: newImg.id,
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
      // string[]だったらどうする？
      if (typeof canvasId === 'string') {
        await this.addUploadedImageCanvases(newImg.id, canvasId)
      }
      useStoreStage().handleEventEndSaveHistory()

      // モード終了し、サブメニューを閉じる
      useStoreMode().$reset()
    },

    // canvasに画像追加 firestoreで使用枚数を更新（追加）
    async addUploadedImageCanvases(imageId: string, canvasId: string) {
      const { uid } = storeToRefs(useAuthStore())
      const docRef = doc(db, 'userImageStorage', uid.value)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const userImages = docSnap.data().images
        if (userImages === undefined) return
        const userImage: UploadedImage = userImages[imageId]
        // canvasesになければ「canvasId: 1」にする
        if (
          userImage.canvases === undefined ||
          userImage.canvases[canvasId] === undefined
        ) {
          userImage.canvases[canvasId] = 1
        } else {
          userImage.canvases[canvasId] += 1
        }
        await setDoc(docRef, {
          images: userImages,
        })
      }
    },

    // canvasから画像削除 firestoreで使用枚数を更新（削除）
    async deleteUploadedImageCanvases(imageId: string, canvasId: string) {
      const { uid } = storeToRefs(useAuthStore())
      const docRef = doc(db, 'userImageStorage', uid.value)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const userImages = docSnap.data().images
        if (userImages === undefined) return
        const userImage: UploadedImage = userImages[imageId]
        // canvasesになければcanvasIdを-1するcanvasIdが0になったらkeyを削除
        if (userImage.canvases[canvasId] !== undefined) {
          if (userImage.canvases[canvasId] > 1)
            userImage.canvases[canvasId] -= 1
          else if (userImage.canvases[canvasId] <= 1) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete userImage.canvases[canvasId]
          }
        }
        await setDoc(docRef, {
          images: userImages,
        })
      }
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
