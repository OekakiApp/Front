import Konva from 'konva'
import { nanoid } from 'nanoid'
import { defineStore } from 'pinia'
import useStoreMode from '@/stores/mode'
// eslint-disable-next-line import/no-cycle
import useStoreStage from '@/stores/konva/stage'

interface UploadedImage {
  id: string
  imgSrc: string
}

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

const useStoreImage = defineStore({
  id: 'image',
  state: () => ({
    dragUrl: '',
    uploadedImages: [] as UploadedImage[],
    konvaImages: [] as KonvaImage[],
  }),

  actions: {
    addImageList(e: Event) {
      const inputElement = e.target as HTMLInputElement
      if (inputElement === null) return
      const { files } = inputElement
      if (files === null) return
      const file = files.item(0)
      if (file === null) return
      this.loadImage(file)
      inputElement.value = ''
    },

    loadImage(file: File) {
      // FileRenderオブジェクト
      const reader = new FileReader()
      // URLとして読み込まれたときに実行する処理
      reader.onload = (e) => {
        const fileReader = e.target
        if (fileReader === null) return
        const imgURL = fileReader.result as string
        const id = nanoid()
        // imageをstoreにupload
        this.uploadedImages = [...this.uploadedImages, { id, imgSrc: imgURL }]
      }
      // ファイルをURLとして読み込む
      reader.readAsDataURL(file)
    },

    // image listから削除
    removeImage(imageId: string) {
      this.uploadedImages = this.uploadedImages.filter(
        (img) => img.id !== imageId,
      )
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
      // add image
      const newImg = new Image()
      newImg.src = this.dragUrl

      // リサイズ
      const originalWidth = newImg.width
      // widthは200pxに縮小するかそのまま
      newImg.width = Math.min(originalWidth, 100)
      // 200pxに縮小したらheightも変更する
      if (newImg.width === 100) {
        newImg.height *= 100 / originalWidth
      }
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
      const { setMode } = useStoreMode()
      setMode('none')
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
