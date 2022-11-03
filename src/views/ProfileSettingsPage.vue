<script setup lang="ts">
import { reactive, ref } from 'vue'
import router from '@/router'
import useAuthStore from '@/stores/auth'
import { db, storage } from '@/firebase/index'
import { doc, updateDoc } from 'firebase/firestore'
import { getAuth, updateProfile } from 'firebase/auth'
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'

const authUser = getAuth().currentUser!
const authStore = useAuthStore()
const icon = ref(authStore.icon)

const iconRef = ref(null)

const inputText = reactive({
  icon: 'person',
  inputType: 'text',
  placeholder: 'Type Your Email',
  text: authStore.name,
  isAlert: false,
  alertText: '名前を入力してください',
  label: '名前',
})

const textArea = reactive({
  icon: 'introduction',
  placeholder: 'Type Your Message',
  text: authStore.profile,
  isAlert: false,
  alertText: '100字以内で入力してください',
  label: '自己紹介',
})

const saveProfile = () => {
  const alertFlag = validate()
  if (!alertFlag) return

  updateFireBase()
  router.push({ name: 'Users' })
}

const onFileUploadToFirebase = () => {
  if (iconRef.value) {
    const file: File = iconRef.value.files[0]
    icon.value = URL.createObjectURL(file)
  }
}

const updateFireBase = async () => {
  // profile
  if (authStore.profile !== textArea.text) {
    const usersId: string = localStorage.getItem('usersId') ?? ''
    const washingtonRef = doc(db, 'users', usersId)
    await updateDoc(washingtonRef, {
      profile: textArea.text,
    })
    authStore.profile = textArea.text
  }

  // Name
  if (authStore.name !== inputText.text) {
    updateProfile(authUser, {
      displayName: inputText.text,
    })
      .then(() => {
        authStore.name = inputText.text
      })
      .catch((error) => {
        console.log(error)
      })
  }
  // icon
  if (authStore.icon !== icon.value && iconRef.value) {
    const file: File = iconRef.value.files[0]
    const fileRef = storageRef(storage, `user-image/${file.name}`)
    const uploadTask = uploadBytesResumable(fileRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        console.log(`Upload is ${progress}% done`)
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused')
            break
          case 'running':
            console.log('Upload is running')
            break

          // no default
        }
      },
      (error) => {
        console.log(error)
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          updateProfile(authUser, {
            photoURL: downloadURL,
          })
            .then(() => {
              authStore.icon = downloadURL
            })
            .catch((error) => {
              console.log(error)
            })
        })
      },
    )
  }
}

const validate = (): boolean => {
  // inputText
  inputText.isAlert = inputText.text === ''
  textArea.isAlert = textArea.text.length > 100

  if (inputText.isAlert === false && textArea.isAlert === false) {
    return true
  }
  return false
}
</script>
<template lang="pug">
div(class="flex max-w-3xl mx-auto mt-8") 
  //- left
  div(class="flex flex-col items-center")
    div
      img(:src="icon" class="big-avatar ring-2 ring-gray-700 ")
    label(class="upload-label inline-block cursor-pointer my-4 p-2") ファイルを選択
      input(id="icon" ref="iconRef" type="file" accept=".png, .jpeg, .jpg" @change="onFileUploadToFirebase()")

  //- right
  div(class="mx-auto w-3/5")
    form(method="post" enctype="multipart/form-data" @submit.prevent="saveProfile")
      div(class="mb-4")
        div(v-show="inputText.isAlert" class="w-full p-2 my-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert")
          span(class="font-medium") {{inputText.alertText}}
        div
          label(class="block mb-2 font-medium text-midnightBlue") {{ inputText.label }}
          input(
        :id="inputText.icon" v-model="inputText.text" :type="inputText.inputType" :placeholder="inputText.placeholder" :value="inputText.text" 
          class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5" required)
      
      div
        div(v-show="textArea.isAlert" class="w-full p-2 my-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert")
          span(class="font-medium") {{textArea.alertText}}
        div
          label(class="block mb-2 font-medium text-midnightBlue") {{ textArea.label }}
          textarea(:id="textArea.icon" v-model="textArea.text" :placeholder="textArea.placeholder" rows="4" class="block p-2.5 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300")

      div(class="flex justify-center items-center mt-8")
        button(type="submit" class="focus:outline-none text-white bg-chardonnay hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-500 font-medium rounded-lg px-5 py-2.5") 保存する
</template>

<style scoped>
.big-avatar {
  vertical-align: middle;
  width: 150px;
  height: 150px;
  border-radius: 50%;
}
/* inputは隠す */
.upload-label input {
  display: none;
}
</style>
