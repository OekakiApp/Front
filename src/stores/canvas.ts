/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { defineStore } from 'pinia'
import { query, where, collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/index'
import useStoreLine from '@/stores/konva/line'
import useStoreText from '@/stores/konva/text'
import useStoreImage from '@/stores/konva/image'
import useStoreHistory from '@/stores/konva/history'
import type { Canvas } from '@/firebase/types'

const useStoreCanvas = defineStore({
  id: 'canvas',
  state: () => ({
    canvases: {} as Record<string, Canvas>,
  }),

  actions: {
    async getCanvases(uid: string) {
      const canvasQuery = query(
        collection(db, 'canvas'),
        where('uid', '==', uid),
      )
      // リアルタイムでアップデートを取得する
      const promise = new Promise<void>((resolve) => {
        onSnapshot(
          canvasQuery,
          (querySnapshot) => {
            const canvases = {} as Record<string, Canvas>
            querySnapshot.forEach((document) => {
              const canvasID = document.id
              canvases[canvasID] = document.data() as Canvas
            })
            this.canvases = canvases
            resolve()
          },
          (error) => {
            console.log(error)
          },
        )
      })
      await promise
    },
    resetCanvas() {
      // delete
      useStoreLine().deleteLines()
      useStoreText().deleteTexts()
      useStoreImage().deleteImages()
      // save history
      useStoreHistory().handleEventEndSaveHistory()
    },
  },
})

export default useStoreCanvas
