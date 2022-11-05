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

const stageParentDiv = ref()
const stage = ref()
const transformer = ref()
const usersId = localStorage.getItem('usersId')
const canvasId = useRoute().params.canvas_id

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
  console.log(typeof canvasId === 'string')

  if (typeof canvasId === 'string' && canvases.value[canvasId] !== undefined) {
    console.log('途中から')
    const canvas = canvases.value[canvasId]
    lines.value = canvas.lines
    texts.value = canvas.texts
  } else {
    console.log('新規')
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
  if (typeof canvasId === 'string' && canvases.value[canvasId] !== undefined) {
    await updateDoc(doc(db, 'canvas', canvasId), {
      name: 'test ' + canvasId,
      lines: lines.value,
      texts: texts.value,
    })
  }
  // 新規の場合
  else {
    const canvasRef = await addDoc(collection(db, 'canvas'), {
      name: 'test ' + canvasId,
      lines: lines.value,
      texts: texts.value,
      uid: usersId,
    })
    console.log('Document written with ID: ', canvasRef.id)
  }
  await saveImage()
}

const saveImage = async () => {
  const file = stage.value.getStage().toDataURL({
    quality: 1,
    pixelRatio: 2,
    mimeType: 'image/png',
  })

  uploadURI(file, canvasId + '.png')
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
      getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
        console.log(downloadURL)
        if (
          typeof canvasId === 'string' &&
          canvases.value[canvasId] !== undefined
        ) {
          await updateDoc(doc(db, 'canvas', canvasId), {
            image: downloadURL,
          })
          await updateImageMetadata(fileRef)
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
