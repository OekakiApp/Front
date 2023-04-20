import type { ClientUploadedImage } from '@/types/index'

function sortImagesByCreatedAt(uploadedImages: ClientUploadedImage[]) {
  return uploadedImages.sort(
    (a: ClientUploadedImage, b: ClientUploadedImage) => {
      if (a.createdAt < b.createdAt) {
        return -1
      }
      if (a.createdAt > b.createdAt) {
        return 1
      }
      return 0
    },
  )
}

export default sortImagesByCreatedAt
