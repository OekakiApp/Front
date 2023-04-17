import { defineStore } from 'pinia'

const useStoreStage = defineStore({
  id: 'stage',
  state: () => ({
    configKonva: {
      size: {
        width: window.innerWidth,
        height: window.innerWidth,
      },
      scale: {
        x: 1,
        y: 1,
      },
    },
  }),

  actions: {
    // Stageのリサイズ
    fitStageIntoParentContainer(stageParentDiv: HTMLDivElement) {
      // Fixed stage size
      const SCENE_BASE_WIDTH = 896
      const SCENE_BASE_HEIGHT = 504

      // Max upscale
      const SCENE_MAX_WIDTH = 1280
      const SCENE_MAX_HEIGHT = 720
      const container = stageParentDiv
      if (container === null) return

      const stageWidth =
        container.offsetWidth % 2 !== 0
          ? container.offsetWidth - 1
          : container.offsetWidth

      this.configKonva.size = {
        width: stageWidth,
        height: (stageWidth * 9) / 16, // aspect-ratio
      }

      const scaleX =
        Math.min(this.configKonva.size.width, SCENE_MAX_WIDTH) /
        SCENE_BASE_WIDTH

      const scaleY =
        Math.min(this.configKonva.size.height, SCENE_MAX_HEIGHT) /
        SCENE_BASE_HEIGHT

      const minRatio = Math.min(scaleX, scaleY)
      this.configKonva.scale = { x: minRatio, y: minRatio }
    },
  },
})

export default useStoreStage
