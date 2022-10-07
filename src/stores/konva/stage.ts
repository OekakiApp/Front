import { defineStore } from 'pinia'

const useStoreStage = defineStore({
  id: 'stage',
  state: () => ({
    configKonva: {
      width: window.innerWidth,
      height: window.innerHeight / 2,
      scale: {
        x: 1,
        y: 1,
      },
    },
  }),

  actions: {
    fitStageIntoParentContainer(container: any) {
      const containerWidth = container.offsetWidth
      const scale = containerWidth / this.configKonva.width
      this.configKonva.width *= scale
      this.configKonva.height *= scale
      this.configKonva.scale.x = scale
      this.configKonva.scale.y = scale
    },
  },
})

export default useStoreStage
