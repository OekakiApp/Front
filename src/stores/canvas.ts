/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { defineStore } from 'pinia'
import {
  query,
  where,
  collection,
  DocumentData,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/firebase/index'
import useStoreLine from '@/stores/konva/line'
import useStoreText from '@/stores/konva/text'
import useStoreImage from '@/stores/konva/image'
import useStoreStage from '@/stores/konva/stage'

const useStoreCanvas = defineStore({
  id: 'canvas',
  state: () => ({
    canvases: {} as DocumentData,
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
            const canvases = {} as DocumentData
            querySnapshot.forEach((document) => {
              const canvasID = document.id
              canvases[canvasID] = document.data()
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
      useStoreStage().handleEventEndSaveHistory()
    },
  },
})

export default useStoreCanvas
