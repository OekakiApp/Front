/* eslint-disable import/no-cycle */
import { nanoid } from 'nanoid'
import { defineStore, storeToRefs } from 'pinia'
import {
  doc,
  Timestamp,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import useAuthStore from '@/stores/auth'
import { db, storage } from '@/firebase/index'
import { KonvaImage } from '@/stores/konva/image'
import sortImagesByCreatedAt from '@/utils/sort'

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

type UserImageStorage = Record<string, UploadedImage>

const useStoreUserImage = defineStore({
  id: 'user-image',
  state: () => ({
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    userImageStorage: {} as UserImageStorage,
  }),

  actions: {
    // Toolbarのリストに画像を追加する
    addImageToToolbar(e: Event) {
      const inputElement = e.target as HTMLInputElement
      if (inputElement === null) return
      const { files } = inputElement
      if (files === null) return
      const file = files.item(0)
      if (file === null) return
      this.uploadImageToStorage(file)
    },

    // Storageに画像をアップロードする。
    uploadImageToStorage(file: File) {
      const { uid } = storeToRefs(useAuthStore())
      const imageId = nanoid()
      const fileExtension = file.name.split('.').pop() as string // input accept .jpeg .png .jpg
      const imageRef = ref(
        storage,
        `user-image/${uid.value}/user-upload/${imageId}.${fileExtension}`,
      )
      const metadata = {
        contentType: file.type, // ex) image/png
      }

      const uploadTask = uploadBytesResumable(imageRef, file, metadata)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log(`Upload is ${progress}% done`)
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused')
              break
            case 'running':
              console.log('Upload is running')
              break
            default:
          }
        },
        (error) => {
          switch (error.code) {
            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              break
            case 'storage/canceled':
              // User canceled the upload
              break
            // ...
            case 'storage/unknown':
              // Unknown error occurred, inspect error.serverResponse
              break
            default:
          }
        },
        () => {
          // Handle successful uploads on complete
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              // firestoreのimageデータを更新
              this.uploadImageToFirestore(downloadURL, file, imageId).catch(
                (error) => {
                  console.log(error.code)
                },
              )
            })
            .catch((error) => {
              console.log(error.code)
            })
        },
      )
    },

    // Storageで作成したurlを受け取り、firestoreに保存する
    async uploadImageToFirestore(url: string, file: File, imageId: string) {
      const { uid } = storeToRefs(useAuthStore())
      const id = imageId
      const fileExtension = file.name.split('.').pop() as string // input accept .jpeg .png .jpg

      const newUploadedImage: UploadedImage = {
        userUid: uid.value,
        id, // imageId
        storageURL: url, // StorageのURL
        fileName: file.name,
        fileType: file.type,
        fileExtension,
        createdAt: Timestamp.now(),
        show: true, // Toolbarに表示・非表示
        countOnCanvas: 0, // key: canvasId, value: 使用数 valueが0になったらkeyを削除
      }

      const { userImageStorage } = this
      userImageStorage[id] = newUploadedImage

      const docRef = doc(db, 'userImageStorage', uid.value)
      await updateDoc(docRef, userImageStorage)
    },

    // ツールバーから画像を削除
    async deleteImageFromToolbar(image: UploadedImage) {
      // firestore上でshowをfalseにする
      const { userImageStorage } = this

      const userImage = userImageStorage[image.id]
      if (userImage !== undefined) {
        userImage.show = false
        userImageStorage[image.id] = userImage

        const docRef = doc(db, 'userImageStorage', image.userUid)
        await updateDoc(docRef, userImageStorage)
      }
    },

    // Storage削除判定
    isDeleteImageFromStorage(uploadedImage: UploadedImage) {
      // 条件canvasで使用されていないかつToolbarで非表示
      return uploadedImage.countOnCanvas <= 0 && !uploadedImage.show
    },

    // ログイン時に呼び出し、削除判定
    // countOnCanvas === 0 && show === false ならfireStoregeとfirebaseから画像削除
    async deleteImageFromStorageWithLogin(uid: string) {
      const { userImageStorage } = this
      if (userImageStorage !== undefined) {
        // eslint-disable-next-line no-restricted-syntax
        for (const key of Object.keys(userImageStorage)) {
          const userImage: UploadedImage | undefined = userImageStorage[key]
          if (
            userImage !== undefined &&
            this.isDeleteImageFromStorage(userImage)
          ) {
            // Storageから削除
            this.deleteImageFromStorage(userImage)
            // firestoreから削除
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete userImageStorage[key]
          }
        }

        const docRef = doc(db, 'userImageStorage', uid)
        await setDoc(docRef, userImageStorage)
      }
    },

    // Storageからユーザーがアップロードした画像を削除する
    deleteImageFromStorage(userImage: UploadedImage) {
      const deletedRef = ref(
        storage,
        `user-image/${userImage.userUid}/user-upload/${userImage.id}.${userImage.fileExtension}`,
      )
      deleteObject(deletedRef)
        .then(() => {
          console.log('image deleted')
        })
        .catch((error) => {
          console.log(error.code)
        })
    },

    // 保存前のKonvaImages[]と保存時のKonvaImages[]を受け取る -> hashmap {imageId: 2, imageId:1}
    diffHashMap(
      firstCanvasImages: KonvaImage[],
      savedCanvasImages: KonvaImage[],
    ) {
      const hashmap = new Map<string, number>()

      // 保存時のキャンバス上の各画像のimageIdに対してcountを1増やす
      for (let i = 0; i < savedCanvasImages.length; i += 1) {
        const { imageId } = savedCanvasImages[i]
        const count = hashmap.get(imageId) ?? 0
        hashmap.set(imageId, count + 1)
      }

      // 保存前のキャンバス上の各画像のimageIdに対してcountを1減らす
      for (let i = 0; i < firstCanvasImages.length; i += 1) {
        const { imageId } = firstCanvasImages[i]
        const count = hashmap.get(imageId) ?? 0
        hashmap.set(imageId, count - 1)
      }

      // 差分のハッシュマップを作成する
      const diff = new Map<string, number>()
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of hashmap) {
        if (value !== 0) {
          diff.set(key, value)
        }
      }
      return diff
    },

    async saveImageCountToFirebase(
      firstCanvasImages: KonvaImage[],
      savedCanvasImages: KonvaImage[],
    ) {
      const { userImageStorage } = this

      if (userImageStorage !== undefined) {
        const countHashmapDiff = this.diffHashMap(
          firstCanvasImages,
          savedCanvasImages,
        )
        // eslint-disable-next-line no-restricted-syntax
        for (const [key, value] of countHashmapDiff) {
          const userImage = userImageStorage[key]
          if (userImage !== undefined) {
            userImage.countOnCanvas += value

            userImageStorage[key] = userImage
          }
        }

        const { uid } = storeToRefs(useAuthStore())
        const docRef = doc(db, 'userImageStorage', uid.value)
        await updateDoc(docRef, userImageStorage)
      }
    },

    async loadUserImageStorage(uid: string) {
      const docRef = doc(db, 'userImageStorage', uid)

      // onsnapshotでローカルのuserImageStorageを更新する
      // eslint-disable-next-line no-return-await
      return await new Promise<void>((resolve) => {
        onSnapshot(
          docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              this.userImageStorage = docSnap.data()
            } else {
              this.userImageStorage = {}
            }
            resolve()
          },
          (error) => {
            console.log(error)
          },
        )
      })
    },
  },

  getters: {
    getToolbarImages(state) {
      const toolbarImages = Object.values(state.userImageStorage).filter(
        (image) => image.show,
      )
      return sortImagesByCreatedAt(toolbarImages)
    },
  },
})

export default useStoreUserImage
