import { defineStore } from 'pinia'

export interface Color {
  rgba: Record<string, string>
  hsv: Record<string, string>
  hex: ''
}

const useStoreColor = defineStore({
  id: 'color',
  state: () => ({
    color: '#59c7f9',
    colorsDefault: [
      '#000000',
      '#FFFFFF',
      '#FF1900',
      '#F47365',
      '#FFB243',
      '#FFE623',
      '#6EFF2A',
      '#1BC7B1',
      '#00BEFF',
      '#2E81FF',
      '#5D61FF',
      '#FF89CF',
      '#FC3CAD',
      '#BF3DCE',
      '#8E00A7',
      'rgba(0,0,0,0)',
    ],
  }),

  actions: {
    changeColor(color: Color) {
      const { r, g, b, a } = color.rgba
      this.color = `rgba(${r}, ${g}, ${b}, ${a})`
    },
  },
})

export default useStoreColor
