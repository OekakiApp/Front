import { nanoid } from 'nanoid'
import { defineStore, storeToRefs } from 'pinia'
import {
  doc,
  Timestamp,
  getDoc,
  setDoc,
  updateDoc,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import useAuthStore from '@/stores/auth'
import { db, storage } from '@/firebase/index'

export interface UploadedImage {
  userUid: string
  id: string
  storageURL: string // for access to storage
  fileName: string // ex) filename.png
  fileType: string // ex) image/jpeg
  fileExtention: string // ex) png
  createdAt: Timestamp
  show: boolean // Toolbarに表示・非表示
  canvases: Record<string, number>
}

export type UserImageStorage = Record<string, UploadedImage>

const useStoreUserImage = defineStore({
  id: 'user-image',
  state: () => ({
    isLoadingImages: true, // true=読み込み中
    uploadedImages: [] as UploadedImage[],
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    userImageStorage: {} as Record<string, UploadedImage>,
  }),

  actions: {
    addImageList(e: Event) {
      const inputElement = e.target as HTMLInputElement
      if (inputElement === null) return
      const { files } = inputElement
      if (files === null) return
      const file = files.item(0)
      if (file === null) return
      this.uploadImageToStorage(file)
    },

    uploadImageToStorage(file: File) {
      const { uid } = storeToRefs(useAuthStore())
      const imageId = nanoid()
      const fileExtention = file.name.split('.').pop() as string // input accept .jpeg .png .jpg
      const imageRef = ref(
        storage,
        `user-image/${uid.value}/user-upload/${imageId}.${fileExtention}`,
      )
      const metadata = {
        contentType: file.type, // ex) image/png
      }

      const uploadTask = uploadBytesResumable(imageRef, file, metadata)

      // Register three observers:
      // 1. 'state_changed' observer, called any time the state changes
      // 2. Error observer, called on failure
      // 3. Completion observer, called on successful completion
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
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
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
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
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
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

    async uploadImageToFirestore(url: string, file: File, imageId: string) {
      const { uid } = storeToRefs(useAuthStore())
      const id = imageId
      const fileExtention = file.name.split('.').pop() as string // input accept .jpeg .png .jpg

      const newImage: UploadedImage = {
        userUid: uid.value,
        id, // imageId
        storageURL: url, // StorageのURL
        fileName: file.name,
        fileType: file.type,
        fileExtention,
        createdAt: Timestamp.now(),
        show: true, // Toolbarに表示・非表示
        canvases: {}, // key: canvasId, value: 使用数 valueが0になったらkeyを削除
      }
      // フロント側でも追加
      this.uploadedImages = [...this.uploadedImages, newImage]
      try {
        const docRef = doc(db, 'userImageStorage', uid.value)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          const newUserImages = {
            [id]: newImage,
          }
          setDoc(docRef, {
            images: newUserImages,
          }).catch((error) => {
            console.log(error.code)
          })
        } else {
          const userImages = docSnap.data().images
          userImages[id] = newImage
          updateDoc(docRef, {
            images: userImages,
          }).catch((error) => {
            console.log(error.code)
          })
        }
      } catch (e) {
        console.log('Error getting cached document:', e)
      }
    },

    async setUserImageToToolbar() {
      const { uid } = storeToRefs(useAuthStore())
      const docRef = doc(db, 'userImageStorage', uid.value)

      const userImages = await this.getImageDocSnap(docRef)
      // ツールバーに画像をセット if(show === true)
      if (userImages !== undefined) {
        Object.keys(userImages).forEach((imageId) => {
          const userImage: UploadedImage = userImages[imageId]
          if (userImage.show) {
            this.uploadedImages.push(userImage)
          }
        })

        // アップロード順に並び替える
        const sortedImages = this.uploadedImages.sort(
          (a: UploadedImage, b: UploadedImage) => {
            if (a.createdAt < b.createdAt) {
              return -1
            }
            if (a.createdAt > b.createdAt) {
              return 1
            }
            return 0
          },
        )
        this.uploadedImages = sortedImages
        this.isLoadingImages = false
      } else {
        this.isLoadingImages = false
      }
    },

    // ツールバーから画像を削除
    async deleteImageFromToolbar(image: UploadedImage) {
      // // フロント側で削除
      this.uploadedImages = this.uploadedImages.filter((i) => i.id !== image.id)
      // firestore上でshowをfalseにする
      const docRef = doc(db, 'userImageStorage', image.userUid)

      const userImages = await this.getImageDocSnap(docRef)

      if (userImages !== undefined) {
        const userImage = userImages[image.id]
        userImage.show = false
        await setDoc(docRef, {
          images: userImages,
        })
      }
    },

    // Storage削除判定
    canDeleteImageFromStorage(uploadedImage: UploadedImage) {
      // 条件canvasで使用されていないかつToolbarで非表示
      return (
        Object.keys(uploadedImage.canvases).length === 0 && !uploadedImage.show
      )
    },

    async deleteImageFromStorageWithLogin() {
      const { uid } = storeToRefs(useAuthStore())
      const docRef = doc(db, 'userImageStorage', uid.value)
      const userImages = await this.getImageDocSnap(docRef)
      if (userImages !== undefined) {
        Object.keys(userImages).forEach((imageId) => {
          const userImage: UploadedImage = userImages[imageId]
          if (this.canDeleteImageFromStorage(userImage)) {
            // Storageから削除
            this.deleteImageFromStorage(userImage)
            // firestoreから削除
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete userImages[imageId]
          }
        })
        setDoc(docRef, {
          images: userImages,
        }).catch((error) => {
          console.log(error.code)
        })
      }
    },

    //
    async getImageDocSnap(
      docRef: DocumentReference<DocumentData>,
    ): Promise<UserImageStorage | undefined> {
      // firestore上で削除
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const userImages: UserImageStorage = docSnap.data().images
        if (userImages !== undefined) return userImages
      }
      return undefined
    },

    // Storageからユーザーがアップロードした画像を削除する
    deleteImageFromStorage(userImage: UploadedImage) {
      const deletedRef = ref(
        storage,
        `user-image/${userImage.userUid}/user-upload/${userImage.id}.${userImage.fileExtention}`,
      )
      deleteObject(deletedRef)
        .then(() => {
          console.log('image deleted')
        })
        .catch((error) => {
          console.log(error.code)
        })
    },

    // canvasIdに一致するcanvasesのcanvasIdプロパティを削除する
    async deleteAllImagesOnCanvas(canvasId: string) {
      const { uid } = storeToRefs(useAuthStore())
      const docRef = doc(db, 'userImageStorage', uid.value)
      const userImages = await this.getImageDocSnap(docRef)
      if (userImages !== undefined) {
        Object.keys(userImages).forEach((imageId) => {
          const userImage: UploadedImage = userImages[imageId]
          // canvasIdの画像があればプロパティを削除
          if (userImage.canvases[canvasId] !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete userImage.canvases[canvasId]
          }
        })
        setDoc(docRef, {
          images: userImages,
        }).catch((error) => {
          console.log(error.code)
        })
      }
    },
  },
})

export default useStoreUserImage
