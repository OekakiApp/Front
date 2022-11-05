import Konva from 'konva'
import { nanoid } from 'nanoid'
import { defineStore } from 'pinia'
import useStoreMode from '@/stores/mode'

interface UploadedImage {
  id: string
  imgSrc: string
}

interface KonvaImage {
  id: string
  imageElement: HTMLImageElement
  x: number
  y: number
}

const useStoreImage = defineStore({
  id: 'image',
  state: () => ({
    dragUrl: '',
    uploadedImages: [] as UploadedImage[],
    // Konva Image
    konvaImages: [] as KonvaImage[],
  }),

  actions: {
    addImageList(e: InputEvent) {
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
      this.konvaImages = this.konvaImages.concat([
        {
          id,
          imageElement: newImg,
          ...stage.getRelativePointerPosition(), // {x, y}
        },
      ])

      const { setMode } = useStoreMode()
      setMode('none')
    },
  },
})

export default useStoreImage
