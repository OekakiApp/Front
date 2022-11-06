<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { db, storage } from '@/firebase/index'
import { doc, collection, addDoc, updateDoc } from 'firebase/firestore'
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
import useStoreText from '@/stores/konva/text'
import useAuthStore from '@/stores/auth'
import useStoreImage from '@/stores/konva/image'
import useStorePointer from '@/stores/konva/pointer'
import useStoreTransformer from '@/stores/konva/transformer'
import Konva from 'konva'

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
type KonvaEventObject<T> = Konva.KonvaEventObject<T>

const { mode } = storeToRefs(useStoreMode())
const { configKonva } = storeToRefs(useStoreStage())
const { lines } = storeToRefs(useStoreLine())
const { canvases } = storeToRefs(useAuthStore())
const { texts, isEditing } = storeToRefs(useStoreText())
const { konvaImages } = storeToRefs(useStoreImage())
const { configShapeTransformer } = storeToRefs(useStoreTransformer())

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

const { setImages } = useStoreImage()

const { setCanvas } = useAuthStore()

const stageParentDiv = ref()
const stage = ref()
const transformer = ref()
const usersId = localStorage.getItem('usersId')
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
  } else if (e.shiftKey && e.key === 'Delete') {
    setMode('eraser')
    setGlobalCompositeOperation()
  } else if (e.key === 't') setMode('text')
  else if (e.key === 's') setMode('sticky')
  else if (e.key === 'i') setMode('image')
  // undo
  // redo
}

onMounted(() => {
  fitStageIntoParentContainer(stageParentDiv.value)
  window.addEventListener('resize', () =>
    fitStageIntoParentContainer(stageParentDiv.value),
  )
  window.addEventListener('keydown', (e) => {
    changeModeByShortCut(e)
    handleKeyDownSelectedNodeDelete(e)
  })

  // 初期化
  lines.value = []
  texts.value = []

  const canvasVal = canvasId.value
  // 途中からの場合
  if (
    typeof canvasVal === 'string' &&
    canvases.value[canvasVal] !== undefined
  ) {
    const canvas = canvases.value[canvasVal]
    lines.value = canvas.lines
    texts.value = canvas.texts
    inputText.text = canvas.name
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', () =>
    fitStageIntoParentContainer(stageParentDiv.value),
  )
  window.removeEventListener('keydown', (e) => {
    changeModeByShortCut(e)
    handleKeyDownSelectedNodeDelete(e)
  })
})

async function saveCanvas(): Promise<void> {
  // 途中からの場合
  let canvasVal = canvasId.value
  if (
    typeof canvasVal === 'string' &&
    canvases.value[canvasVal] !== undefined
  ) {
    await updateDoc(doc(db, 'canvas', canvasVal), {
      name: inputText.text === '' ? 'タイトル' : inputText.text,
      lines: lines.value,
      texts: texts.value,
    })
  }
  // 新規の場合
  else {
    const canvasRef = await addDoc(collection(db, 'canvas'), {
      name: inputText.text === '' ? 'タイトル' : inputText.text,
      lines: lines.value,
      texts: texts.value,
      uid: usersId,
    })
    canvasId.value = canvasRef.id
    canvasVal = canvasId.value
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

const updateImageMetadata = async (fileRef: any) => {
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
  button(type="btn" class="focus:outline-none text-white bg-seaPink hover:bg-red-400 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-2 py-1" @click='saveCanvas()') 保存
div(class="m-auto border-4 max-w-screen-xl relative")
  div(ref="stageParentDiv" class="bg-white w-full" @drop="(e) => {setImages(e, stage)}" @dragover="(e) => {e.preventDefault();}")
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
        v-image(
          v-for="image in konvaImages"
          :key="image.id"
          :draggable="true"
          :config="{image:image.imageElement, x: image.x-image.imageElement.width/2, y: image.y-image.imageElement.height/2}"
        )
        v-line(
          v-for="line ,index in lines"
          :key="index"
          :config="{stroke:line.color, points:line.points, strokeWidth:line.strokeWidth, dash: line.dash, dashEnabled: line.dashEnabled, tension:0.1, lineCap:'round', lineJoin:'round', globalCompositeOperation: line.globalCompositeOperation}"
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

ToolBar(:stage="stage")
</template>
