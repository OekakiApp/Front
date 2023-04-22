import { Timestamp } from 'firebase/firestore'
import { Points, TextNode, FirestoreCanvasImage } from '@/types/konva'

// canvas
export interface Canvas {
  name: string
  lines: Points[]
  texts: TextNode[]
  konvaImages: FirestoreCanvasImage[]
  uid: string
  createdAt: Timestamp
  updatedAt: Timestamp
  isShare: false
  image: string
}

// users
export interface User {
  name: string
  icon: string
  profile: string
}

// userImageStorage
export type UserImageStorage = Record<string, UploadedImage>
export interface UploadedImage {
  userUid: string // アップロードしたユーザーのid
  id: string // 画像自身のid
  storageURL: string // for access to storage
  fileName: string // ex) filename.png
  fileType: string // ex) image/jpeg
  fileExtension: string // ex) png
  createdAt: Timestamp // アップロードされた日
  show: boolean // Toolbarに表示・非表示
  countOnCanvas: number // 使用されている枚数
}
