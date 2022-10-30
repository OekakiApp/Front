export interface Color {
  name: string
  type: 'color-button' | 'color-picker'
  color: string
  style?: {
    'background-color': string
  }
  onClick?: () => void
}

export interface InputTextType {
  icon: string
  inputType: string
  placeholder: string
  text: string
  isAlert: boolean
  alertText: string
}
