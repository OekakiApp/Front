<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { db, storage } from '@/firebase/index'
import {
  doc,
  Timestamp,
  updateDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore'
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  updateMetadata,
} from 'firebase/storage'
import ToolBar from '@/components/ToolBar.vue'
import UserCursor from '@/components/UserCursor.vue'
import useStoreMode from '@/stores/mode'
import useStoreStage from '@/stores/konva/stage'
import useStoreLine from '@/stores/konva/line'
import useStoreText, { fontFamilyList } from '@/stores/konva/text'
import useAuthStore from '@/stores/auth'
import useStoreImage from '@/stores/konva/image'
import useStorePointer from '@/stores/konva/pointer'
import useStoreTransformer from '@/stores/konva/transformer'
import Konva from 'konva'
import WebFont from 'webfontloader'
import useStoreUserImage from '@/stores/userImage'
import _ from 'lodash'

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
type KonvaEventObject<T> = Konva.KonvaEventObject<T>
const StorageReference = storageRef(storage, '')

const { mode } = storeToRefs(useStoreMode())
const { configKonva, canvasHistory, canvasStorageHistory, historyStep } =
  storeToRefs(useStoreStage())
const { lines } = storeToRefs(useStoreLine())
const { texts, isEditing, isFontLoaded } = storeToRefs(useStoreText())
const { canvases, uid } = storeToRefs(useAuthStore())
const { konvaImages } = storeToRefs(useStoreImage())
const { configShapeTransformer, selectedShapeId } = storeToRefs(
  useStoreTransformer(),
)
const { userImageStorage } = storeToRefs(useStoreUserImage())
const { getImageDocSnap } = useStoreUserImage()

const { setMode } = useStoreMode()
const { fitStageIntoParentContainer } = useStoreStage()
const {
  handleLineMouseDown,
  handleLineMouseMove,
  handleLineMouseUp,
  handleLineMouseLeave,
  setGlobalCompositeOperation,
} = useStoreLine()

const { createNewTextNode, toggleEdit, handleTextDragEnd } = useStoreText()

const {
  handleMouseDownTransformer,
  handleTransform,
  handleTransformEnd,
  handleKeyDownSelectedNodeDelete,
} = useStoreTransformer()

const {
  handlePointerMouseEnter,
  handlePointerMouseMove,
  handlePointerStageMouseLeave,
  handlePointerMouseLeave,
  handlePointerMouseOver,
  handlePointerMouseDown,
  handlePointerMouseUp,
} = useStorePointer()

const {
  changeKonvaImagesToFirestoreCanvasImages,
  changeFirestoreCanvasImagesToKonvaImages,
  setImages,
  handleImageDragEnd,
} = useStoreImage()

const { setCanvas } = useAuthStore()

const stageParentDiv = ref()
const stage = ref()
const transformer = ref()
const canvasId = ref(useRoute().params.canvas_id)
// const selectionRectangle = ref()

const inputText = reactive({
  inputType: 'text',
  placeholder: 'タイトル',
  text: 'タイトル',
  isEditing: false,
})

const focusInput = () => {
  inputText.isEditing = true
}

const blurInput = () => {
  inputText.isEditing = false
}

// ショートカット
const changeModeByShortCut = (e: KeyboardEvent) => {
  // テキスト編集中はショートカット無効
  if (isEditing.value || inputText.isEditing) return
  if (e.key === 'h') setMode('hand')
  else if (e.key === 'v') setMode('select')
  else if (e.key === 'p' || e.key === 'm') {
    setMode('pen')
    setGlobalCompositeOperation()
    configShapeTransformer.value.nodes = []
    selectedShapeId.value = ''
  } else if (e.shiftKey && e.key === 'Delete') {
    setMode('eraser')
    setGlobalCompositeOperation()
    configShapeTransformer.value.nodes = []
    selectedShapeId.value = ''
  } else if (e.key === 't') setMode('text')
  else if (e.key === 's') setMode('sticky')
  else if (e.key === 'i') setMode('image')
  // undo
  // redo
}

onMounted(async () => {
  fitStageIntoParentContainer(stageParentDiv.value)
  window.addEventListener('resize', () =>
    fitStageIntoParentContainer(stageParentDiv.value),
  )
  window.addEventListener('keydown', (e) => {
    changeModeByShortCut(e)
    handleKeyDownSelectedNodeDelete(e, canvasId.value)
  })

  // Font読み込み
  if (!isFontLoaded.value) {
    WebFont.load({
      google: {
        families: fontFamilyList,
      },
      loading: () => {
        console.log('font is loading')
      },
      // 全てWebフォントの読み込みが完了したときに発火
      active: () => {
        isFontLoaded.value = true
        console.log('fonts is loaded!')
      },
    })
  }
  // 初期化
  lines.value = []
  texts.value = []
  konvaImages.value = []
  // 履歴初期化
  canvasHistory.value = [{ lines: [], texts: [], images: [] }]
  historyStep.value = 0

  const canvasVal = canvasId.value
  // 途中からの場合
  if (
    typeof canvasVal === 'string' &&
    canvases.value[canvasVal] !== undefined
  ) {
    const canvas = canvases.value[canvasVal]
    lines.value = canvas.lines
    texts.value = canvas.texts
    konvaImages.value = changeFirestoreCanvasImagesToKonvaImages(
      canvas.konvaImages,
    )
    inputText.text = canvas.name
    // 履歴をセット
    canvasHistory.value = [
      {
        lines: _.cloneDeep(canvas.lines),
        texts: _.cloneDeep(canvas.texts),
        images: _.cloneDeep(konvaImages.value),
      },
    ]
  }
  const docRef = doc(db, 'userImageStorage', uid.value)
  const images = await getImageDocSnap(docRef)
  if (images !== undefined) {
    userImageStorage.value = images
  }

  // onsnapshotでローカルのuserImageStorageを更新する
  onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const userImages = docSnap.data().images
      userImageStorage.value = userImages
    } else {
      userImageStorage.value = {}
    }
  })
  canvasStorageHistory.value = [userImageStorage.value]
})

onUnmounted(() => {
  window.removeEventListener('resize', () =>
    fitStageIntoParentContainer(stageParentDiv.value),
  )
  window.removeEventListener('keydown', (e) => {
    changeModeByShortCut(e)
    handleKeyDownSelectedNodeDelete(e, canvasId.value)
  })
  // canvasHistoryのリセット
  historyStep.value = 0
  canvasHistory.value = [{ lines: [], texts: [], images: [] }]
  canvasStorageHistory.value = [userImageStorage.value]
})

const saveCanvas = async (): Promise<void> => {
  // 途中からの場合
  const canvasVal = canvasId.value
  console.log(canvasVal)
  if (
    typeof canvasVal === 'string' &&
    canvases.value[canvasVal] !== undefined
  ) {
    // createdAtがある場合
    if (canvases.value[canvasVal].createdAt !== undefined) {
      await updateDoc(doc(db, 'canvas', canvasVal), {
        name: inputText.text === '' ? 'タイトル' : inputText.text,
        lines: lines.value,
        texts: texts.value,
        konvaImages: changeKonvaImagesToFirestoreCanvasImages(
          konvaImages.value,
        ),
        updatedAt: Timestamp.now(),
      })
    }
    // createdAtがない場合
    else {
      await updateDoc(doc(db, 'canvas', canvasVal), {
        name: inputText.text === '' ? 'タイトル' : inputText.text,
        lines: lines.value,
        texts: texts.value,
        konvaImages: changeKonvaImagesToFirestoreCanvasImages(
          konvaImages.value,
        ),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
    }
  }
  // 新規の場合
  else if (
    typeof canvasVal === 'string' &&
    canvases.value[canvasVal] === undefined
  ) {
    await setDoc(doc(db, 'canvas', canvasVal), {
      name: inputText.text === '' ? 'タイトル' : inputText.text,
      lines: lines.value,
      texts: texts.value,
      konvaImages: changeKonvaImagesToFirestoreCanvasImages(konvaImages.value),
      uid: uid.value,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  }

  saveImage()
}

const saveImage = () => {
  const canvasVal = canvasId.value
  const file = stage.value.getStage().toDataURL({
    quality: 1,
    pixelRatio: 2,
    mimeType: 'image/png',
  })

  uploadURI(file, `${canvasVal}.png`)
}

const uploadURI = async (uri: string, name: string) => {
  const blob = await (await fetch(uri)).blob()
  const file = new File([blob], name)

  const fileRef = storageRef(storage, `canvas-image/${name}`)
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
      const canvasVal = canvasId.value
      getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
        if (typeof canvasVal === 'string') {
          await updateDoc(doc(db, 'canvas', canvasVal), {
            image: downloadURL,
          })
          await updateImageMetadata(fileRef)

          // store 更新
          if (typeof canvasVal === 'string') {
            await setCanvas(canvasVal)
          }
        }
      })
    },
  )
}

const updateImageMetadata = async (fileRef: typeof StorageReference) => {
  const newMetadata = {
    contentType: 'image/png',
  }

  await updateMetadata(fileRef, newMetadata)
    .then((metadata) => {
      console.log(metadata)
    })
    .catch((error) => {
      console.log(error)
    })
}
</script>

<template lang="pug">
div(class="flex justify-center items-center my-4")
  input( v-model="inputText.text" :type="inputText.inputType" :placeholder="inputText.placeholder" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-1/3 p-1 mr-8" @focus='focusInput()' @blur='blurInput()')
  button(type="button" class="focus:outline-none text-white bg-seaPink hover:bg-red-400 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-2 py-1" @click="saveCanvas" ) 保存
div(class="m-auto border-4 border-orange-100 max-w-screen-xl my-4")
  div(ref="stageParentDiv" class="bg-white w-full" @drop="(e) => {setImages(e, stage, canvasId)}" @dragover="(e) => {e.preventDefault();}")
    v-stage(
      ref="stage"
      :draggable="mode === 'hand'"
      :config="configKonva"
      @mouseenter="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseEnter(e);}"
      @mouseleave="(e: KonvaEventObject<MouseEvent>) => {handleLineMouseLeave();handlePointerStageMouseLeave(e);}"
      @mousedown="(e: KonvaEventObject<MouseEvent>) => {handleLineMouseDown(e);handleMouseDownTransformer(e);handlePointerMouseEnter(e);}"
      @mousemove="(e: KonvaEventObject<MouseEvent>) => {handleLineMouseMove(e);handlePointerMouseMove(e);}"
      @mouseup="() => {handleLineMouseUp();}"
      @dblclick="(e: KonvaEventObject<MouseEvent>) => {createNewTextNode(e);}"
      )
      v-layer
        v-rect(:config="{name: 'background-rect', x: 0, y: 0, width: configKonva.size.width / configKonva.scale.x, height: configKonva.size.height / configKonva.scale.y, fill: '#FFFFFF'}")
      v-layer
        v-image(
          v-for="image in konvaImages"
          :key="image.id"
          :draggable="true"
          :config="image"
          @dragend="(e: KonvaEventObject<DragEvent>) => {handleImageDragEnd(e);}"
          @mouseover="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseOver(e);}"
          @mousedown="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseDown(e);}"
          @mouseup="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseUp(e)}"
          @mouseleave="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseLeave(e);}"
          @transform="(e: KonvaEventObject<MouseEvent>) => handleTransform(e)"
          @transformend="handleTransformEnd"
        )
        v-line(
          v-for="line in lines"
          :key="line.id"
          :config="{id: line.id, name: line.name, stroke:line.color, points:line.points, strokeWidth:line.strokeWidth, dash: line.dash, dashEnabled: line.dashEnabled, tension:0.1, lineCap:'round', lineJoin:'round', globalCompositeOperation: line.globalCompositeOperation}"
          )
        v-text(
          v-for="text in texts"
          :key="text.id"
          :config="text"
          @dragend="(e: KonvaEventObject<DragEvent>) => handleTextDragEnd(e)"
          @transformend="handleTransformEnd"
          @mouseover="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseOver(e);}"
          @mousedown="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseDown(e);}"
          @mouseup="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseUp(e)}"
          @mouseleave="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseLeave(e);}"
          @transform="(e: KonvaEventObject<MouseEvent>) => handleTransform(e)"
          @dblclick="(e: KonvaEventObject<MouseEvent>) => toggleEdit(e, transformer, stageParentDiv)"
          )
        //- pen eraser時のcursor
        UserCursor
        //- v-rect(
        //- ref="selectionRectangle"
        //- :config="configSelectionRectangle"
        //- )
        v-transformer(ref="transformer" :config="configShapeTransformer")
div(class="container")
  ToolBar(:stage="stage")
</template>
