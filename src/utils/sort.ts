import type { UploadedImage } from '@/firebase/types/index'

function sortImagesByCreatedAt(uploadedImages: UploadedImage[]) {
  return uploadedImages.sort((a: UploadedImage, b: UploadedImage) => {
    if (a.createdAt < b.createdAt) {
      return -1
    }
    if (a.createdAt > b.createdAt) {
      return 1
    }
    return 0
  })
}

export default sortImagesByCreatedAt
