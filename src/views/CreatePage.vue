<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'
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
import useStoreMode from '@/stores/mode'
import useStoreStage from '@/stores/konva/stage'
import useStoreLine from '@/stores/konva/line'
import useStoreText from '@/stores/konva/text'
import useAuthStore from '@/stores/auth'

const { mode } = storeToRefs(useStoreMode())
const { configKonva } = storeToRefs(useStoreStage())
const { lines } = storeToRefs(useStoreLine())
const { texts, configTransformer } = storeToRefs(useStoreText())
const { canvases } = storeToRefs(useAuthStore())

const { setMode } = useStoreMode()
const { fitStageIntoParentContainer } = useStoreStage()
const {
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  setGlobalCompositeOperation,
} = useStoreLine()

const {
  createNewTextNode,
  handleStageMouseDown,
  handleTransform,
  handleTransformEnd,
  toggleEdit,
} = useStoreText()

const { setCanvas } = useAuthStore()

const stageParentDiv = ref()
const stage = ref()
const transformer = ref()
const usersId = localStorage.getItem('usersId')
const canvasId = ref(useRoute().params.canvas_id)

// ショートカット
const changeModeByShortCut = (e: KeyboardEvent) => {
  if (e.key === 'h') setMode('hand')
  else if (e.key === 'v') setMode('select')
  else if (e.key === 'p' || e.key === 'm') {
    setMode('pen')
    setGlobalCompositeOperation('pen')
  } else if (e.shiftKey && e.key === 'Delete') {
    setMode('eraser')
    setGlobalCompositeOperation('eraser')
  } else if (e.key === 't') setMode('text')
  else if (e.key === 's') setMode('sticky')
  // open image file
  // undo
  // redo
}

onMounted(() => {
  fitStageIntoParentContainer(stageParentDiv.value)
  window.addEventListener('resize', () =>
    fitStageIntoParentContainer(stageParentDiv.value),
  )
  window.addEventListener('keydown', changeModeByShortCut)

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
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', () =>
    fitStageIntoParentContainer(stageParentDiv.value),
  )
  window.removeEventListener('keydown', changeModeByShortCut)
})

async function saveCanvas(): Promise<void> {
  // 途中からの場合
  let canvasVal = canvasId.value
  if (
    typeof canvasVal === 'string' &&
    canvases.value[canvasVal] !== undefined
  ) {
    await updateDoc(doc(db, 'canvas', canvasVal), {
      name: `test ${canvasVal}`,
      lines: lines.value,
      texts: texts.value,
    })
  }
  // 新規の場合
  else {
    const canvasRef = await addDoc(collection(db, 'canvas'), {
      name: `test ${canvasVal}`,
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
div(class="flex justify-center items-center")
  button(type="btn" class="focus:outline-none text-white bg-seaPink hover:bg-red-400 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-5 py-2.5" @click='saveCanvas()') 保存
div(class="m-auto border-4 max-w-screen-xl relative my-8")
  div(ref="stageParentDiv" class="bg-white w-full")
    v-stage(
      ref="stage"
      :draggable="mode === 'hand'"
      :config="configKonva"
      @mousedown="(e) => {handleMouseDown(e, mode);handleStageMouseDown(e, transformer.getNode())}"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @dblclick="(e) => createNewTextNode(e, mode)")
      //- @touchstart="(e:Konva.KonvaEventObject<TouchEvent>) => handleStageMouseDown(e, transformer)"

      v-layer
        v-rect(:config="{name: 'background-rect', x: 0, y: 0, width: configKonva.size.width / configKonva.scale.x, height: configKonva.size.height / configKonva.scale.y, fill: '#FFFFFF'}")
        v-line(
          v-for="line ,index in lines"
          :key="index"
          :config="{stroke:line.color, points:line.points, strokeWidth:line.strokeWidth, dash: line.dash, dashEnabled: line.dashEnabled, tension:0.1, lineCap:'round', lineJoin:'round', globalCompositeOperation: line.globalCompositeOperation}"
          )
        v-text(
          v-for="text, index in texts"
          :key="index"
          :config="text"
          @transformend="handleTransformEnd"
          @transform="() => handleTransform(transformer.getNode())"
          @dblclick="() => toggleEdit(transformer.getNode(), stageParentDiv)"
          )
        v-transformer(ref="transformer" :config="configTransformer")

ToolBar(:stage="stage")
</template>
