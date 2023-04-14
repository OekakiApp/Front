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
