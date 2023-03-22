// eslint-disable-next-line import/no-cycle
import { UploadedImage } from '@/stores/userImage'

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
