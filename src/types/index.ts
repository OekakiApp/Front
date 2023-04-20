import type { Mode } from '@/types/mode'
import { Timestamp } from 'firebase/firestore'

// CreatePage
export interface Color {
  name: string
  type: 'color-button' | 'color-picker'
  color: string
  style?: {
    'background-color': string
  }
  onClick: () => void
}

export type SaveState = 'normal' | 'loading' | 'done'

// SignupPage
export interface SignUpInputTextType {
  icon: string
  inputType: string
  placeholder: string
  text: string
  isAlert: boolean
  alertText: string
}
// LoginPage
export interface LoginInputTextType {
  icon: string
  inputType: string
  placeholder: string
  text: string
}

// TopPage
export interface faqType {
  question: string
  answer: string
}

// Toolbar
export interface ToolArray {
  icon: string
  mode: Mode
  tooltip: string
  shortcut: string
  event: () => void
}

export interface TextAlignmentArray {
  icon: string
  tooltip: string
  onClick: () => void
}

export interface UndoRedoArray {
  icon: string
  tooltip: string
  onClick: () => void
}

// userImageStorage
export type UserImageStorage = Record<string, ClientUploadedImage>
export interface ClientUploadedImage {
  userUid: string // アップロードしたユーザーのid
  id: string // 画像自身のid
  storageURL: string // for access to storage
  fileName: string // ex) filename.png
  fileType: string // ex) image/jpeg
  fileExtension: string // ex) png
  createdAt: Timestamp // アップロードされた日
  show: boolean // Toolbarに表示・非表示
  countOnCanvas: number // 使用されている枚数
  loaded: boolean // 画像の読み込み
}
