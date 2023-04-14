<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db, storage } from '@/firebase/index'
import { doc, Timestamp, updateDoc, setDoc } from 'firebase/firestore'
import {
  ref as storageRef,
  getDownloadURL,
  uploadString,
} from 'firebase/storage'
import ToolBar from '@/components/ToolBar.vue'
import UserCursor from '@/components/UserCursor.vue'
import useStoreMode from '@/stores/mode'
import useStoreLine from '@/stores/konva/line'
import useStoreText, { fontFamilyList } from '@/stores/konva/text'
import useAuthStore from '@/stores/auth'
import useStoreCanvas from '@/stores/canvas'
import useStoreImage from '@/stores/konva/image'
import useStorePointer from '@/stores/konva/pointer'
import useStoreTransformer from '@/stores/konva/transformer'
import useStoreUserImage from '@/stores/userImage'
import Konva from 'konva'
import WebFont from 'webfontloader'
import _ from 'lodash'
import useStoreHistory from '@/stores/konva/history'

// useStore start
const { canvasHistory } = storeToRefs(useStoreHistory())
const { lines } = storeToRefs(useStoreLine())
const { texts, isEditing } = storeToRefs(useStoreText())
const { uid } = storeToRefs(useAuthStore())
const { canvases } = storeToRefs(useStoreCanvas())
const { konvaImages, firstKonvaImages } = storeToRefs(useStoreImage())
const { configShapeTransformer } = storeToRefs(useStoreTransformer())
const { saveImageCountToFirebase } = useStoreUserImage()

const { setMode } = useStoreMode()
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
  setImagesOnCanvas,
  handleImageDragEnd,
} = useStoreImage()
// useStore end

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
type KonvaEventObject<T> = Konva.KonvaEventObject<T>
type SaveState = 'normal' | 'loading' | 'done'

const stageParentDiv = ref()
const stage = ref()
const transformer = ref()
const canvasId = ref(useRoute().params.canvas_id as string)
const router = useRouter()
const saveState = ref<SaveState>('normal')
// const selectionRectangle = ref()

const configKonva = reactive({
  size: {
    width: window.innerWidth,
    height: window.innerWidth,
  },
  scale: {
    x: 1,
    y: 1,
  },
})

// Stageのリサイズ
const fitStageIntoParentContainer = () => {
  // Fixed stage size
  const SCENE_BASE_WIDTH = 896
  const SCENE_BASE_HEIGHT = 504

  // Max upscale
  const SCENE_MAX_WIDTH = 1280
  const SCENE_MAX_HEIGHT = 720
  const container = stageParentDiv.value
  if (container === null) return

  const stageWidth =
    container.offsetWidth % 2 !== 0
      ? container.offsetWidth - 1
      : container.offsetWidth

  configKonva.size = {
    width: stageWidth,
    height: (stageWidth * 9) / 16, // aspect-ratio
  }

  const scaleX =
    Math.min(configKonva.size.width, SCENE_MAX_WIDTH) / SCENE_BASE_WIDTH

  const scaleY =
    Math.min(configKonva.size.height, SCENE_MAX_HEIGHT) / SCENE_BASE_HEIGHT

  const minRatio = Math.min(scaleX, scaleY)
  configKonva.scale = { x: minRatio, y: minRatio }
}

const showDoneBtn = () => {
  saveState.value = 'done'
  setTimeout(() => {
    saveState.value = 'normal'
  }, 3000)
}

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
// TODO: 全てのショートカット実装
const changeModeByShortCut = (e: KeyboardEvent) => {
  // テキスト編集中はショートカット無効
  if (isEditing.value || inputText.isEditing) return
  if (e.key === 'h') setMode('hand')
  else if (e.key === 'v') setMode('select')
  else if (e.key === 'p' || e.key === 'm') {
    setMode('pen')
    setGlobalCompositeOperation('source-over')
    useStoreTransformer().$reset()
  } else if (e.shiftKey && e.key === 'Delete') {
    setMode('eraser')
    setGlobalCompositeOperation('destination-out')
    useStoreTransformer().$reset()
  } else if (e.key === 't') setMode('text')
  else if (e.key === 's') setMode('sticky')
  else if (e.key === 'i') setMode('image')
  // undo
  // redo
}

// CreatePageに関わるstoreを初期化
const initializeCanvas = () => {
  useStoreMode().$reset()
  useStoreLine().$reset()
  useStoreText().$reset()
  useStoreImage().$reset()
  useStoreHistory().$reset()
  useStoreTransformer().$reset()
}

onMounted(() => {
  // 初期化
  initializeCanvas()
  // Stageのリサイズ
  fitStageIntoParentContainer()

  window.addEventListener('resize', () => fitStageIntoParentContainer())
  window.addEventListener('keydown', (e) => {
    changeModeByShortCut(e)
    handleKeyDownSelectedNodeDelete(e)
  })

  // キャンバスが既にある場合
  const canvasID = canvasId.value
  if (canvases.value[canvasID] !== undefined) {
    const canvas = canvases.value[canvasID]
    // キャンバスの各プロパティをセット
    lines.value = _.cloneDeep(canvas.lines)
    texts.value = _.cloneDeep(canvas.texts)
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
    // 編集開始時のkonvaImagesをセット(画像の使用状況追跡のため)
    firstKonvaImages.value = _.cloneDeep(konvaImages.value)
  }

  // Font読み込み(キャンバスのセット後に読み込む必要あり)
  WebFont.load({
    google: {
      families: fontFamilyList,
    },
    loading: () => {
      console.log('font is loading')
    },
    // 全てWebフォントの読み込みが完了したときに発火
    active: () => {
      console.log('fonts is loaded!')
    },
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', () => fitStageIntoParentContainer())
  window.removeEventListener('keydown', (e) => {
    changeModeByShortCut(e)
    handleKeyDownSelectedNodeDelete(e)
  })
})

// セーブ中は他のページに遷移できない
router.beforeEach(() => {
  if (saveState.value === 'loading') {
    return false
  }
  return true
})

// キャンバスの保存
const saveCanvas = async (): Promise<void> => {
  // 選択を解除
  useStoreTransformer().$reset()
  // btn loadingに変更
  saveState.value = 'loading'

  // 途中からの場合
  const canvasID = canvasId.value
  if (canvases.value[canvasID] !== undefined) {
    await updateDoc(doc(db, 'canvas', canvasID), {
      name: inputText.text === '' ? 'タイトル' : inputText.text,
      lines: lines.value,
      texts: texts.value,
      konvaImages: changeKonvaImagesToFirestoreCanvasImages(konvaImages.value),
      // createdAtの有無を判定
      createdAt:
        canvases.value[canvasID].createdAt === undefined
          ? Timestamp.now()
          : canvases.value[canvasID].createdAt,
      updatedAt: Timestamp.now(),
      // isShareの有無を判定
      isShare:
        canvases.value[canvasID].isShare === undefined
          ? false
          : canvases.value[canvasID].isShare,
    })
  }
  // 新規の場合
  else {
    await setDoc(doc(db, 'canvas', canvasID), {
      name: inputText.text === '' ? 'タイトル' : inputText.text,
      lines: lines.value,
      texts: texts.value,
      konvaImages: changeKonvaImagesToFirestoreCanvasImages(konvaImages.value),
      uid: uid.value,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isShare: false,
    })
  }
  // 画像の使用枚数の更新
  saveImageCountToFirebase(firstKonvaImages.value, konvaImages.value)
  // 保存時点でのkonvaImagesをセット(画像の使用状況追跡のため)
  firstKonvaImages.value = _.cloneDeep(konvaImages.value)
  // サムネイルを生成・保存
  generateAndSaveThumbnail()
}

// サムネイルを生成し、storageにアップロード
// キャンバスのサムネイルとしてfiresotreに保存
const generateAndSaveThumbnail = () => {
  // キャンバスからData URL stringを取得
  const dataURLString: string = stage.value.getStage().toDataURL({
    quality: 1,
    pixelRatio: 2,
    mimeType: 'image/png',
  })
  const thumbnailName = `${canvasId.value}.png`
  // 保存先の参照を生成(firebase storage)
  const fileRef = storageRef(storage, `canvas-image/${thumbnailName}`)
  const metadata = {
    contentType: 'image/png',
  }
  // 文字列(Data URL string)から画像をアップロード
  uploadString(fileRef, dataURLString, 'data_url', metadata).then(
    (snapshot) => {
      console.log('Uploaded a data_url string!')
      // storageの画像URLをダウンロード
      getDownloadURL(snapshot.ref).then(async (downloadURL) => {
        await updateDoc(doc(db, 'canvas', canvasId.value), {
          image: downloadURL,
        })
        // firebase,storageの更新終了
        // btn done -> normal
        showDoneBtn()
      })
    },
  )
}
</script>

<template lang="pug">
div(class="flex justify-center items-center my-4")
  input( v-model="inputText.text" :type="inputText.inputType" :placeholder="inputText.placeholder" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-1/3 p-1 mr-8" @focus='focusInput()' @blur='blurInput()')
  //- normal
  button(v-show="saveState === 'normal'" type="button" class="focus:outline-none text-white bg-seaPink hover:bg-red-400 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-2 py-1" @click='saveCanvas()') 保存
  //- loading
  button(v-show="saveState === 'loading'" type="button" class="focus:outline-none text-white bg-seaPink hover:bg-red-400 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-4 py-1")
    svg(role="status" class="inline w-4 h-4 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg")
      path(d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB")
      path(d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor")
  //- done
  button(v-show="saveState === 'done'" type="button" class="flex items-center focus:outline-none text-white bg-seaPink hover:bg-red-400 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-4 py-1.5")
    span(class="material-symbols-outlined") done

div(class="m-auto border-4 border-orange-100 max-w-screen-xl my-4")
  div(ref="stageParentDiv" class="bg-white w-full" @drop="(e) => {setImagesOnCanvas(e, stage)}" @dragover.prevent)
    v-stage(
      ref="stage"
      :config="configKonva"
      @mouseenter="(e: KonvaEventObject<PointerEvent>) => {handlePointerMouseEnter(e);}"
      @mouseleave="(e: KonvaEventObject<MouseEvent>) => {handleLineMouseLeave();handlePointerStageMouseLeave(e);}"
      @mousedown="(e: KonvaEventObject<PointerEvent>) => {handlePointerMouseEnter(e);}"
      @pointerdown="(e: KonvaEventObject<PointerEvent>) => {handleLineMouseDown(e);handleMouseDownTransformer(e)}"
      @pointermove="(e: KonvaEventObject<PointerEvent>) => {handleLineMouseMove(e);handlePointerMouseMove(e);}"
      @pointerup="(e: KonvaEventObject<PointerEvent>) => {handleLineMouseUp(e);}"
      @dblclick="(e: KonvaEventObject<MouseEvent>) => {createNewTextNode(e);}"
      @dbltap="(e: KonvaEventObject<TouchEvent>) => {createNewTextNode(e);}"
      )
      v-layer
        v-rect(:config="{name: 'background-rect', x: 0, y: 0, width: configKonva.size.width / configKonva.scale.x, height: configKonva.size.height / configKonva.scale.y, fill: '#FFFFFF'}")
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
          @transform="(e: KonvaEventObject<MouseEvent | TouchEvent>) => handleTransform(e)"
          @transformend="handleTransformEnd"
        )
        v-text(
          v-for="text in texts"
          :key="text.id"
          :config="text"
          @dragend="(e: KonvaEventObject<DragEvent>) => handleTextDragEnd(e)"
          @mouseover="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseOver(e);}"
          @mousedown="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseDown(e);}"
          @mouseup="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseUp(e)}"
          @mouseleave="(e: KonvaEventObject<MouseEvent>) => {handlePointerMouseLeave(e);}"
          @transform="(e: KonvaEventObject<MouseEvent>) => handleTransform(e)"
          @transformend="handleTransformEnd"
          @dblclick="(e: KonvaEventObject<MouseEvent>) => toggleEdit(e, transformer, stageParentDiv)"
          @dbltap="(e: KonvaEventObject<TouchEvent>) => toggleEdit(e, transformer, stageParentDiv)"
          )
      v-layer
        v-line(
          v-for="line in lines"
          :key="line.id"
          :config="{id: line.id, name: line.name, stroke:line.color, points:line.points, strokeWidth:line.strokeWidth, dash: line.dash, dashEnabled: line.dashEnabled, tension:0.1, lineCap:'round', lineJoin:'round', globalCompositeOperation: line.globalCompositeOperation}"
          )
        //- pen eraser時のcursor
        UserCursor
        //- v-rect(
        //- ref="selectionRectangle"
        //- :config="configSelectionRectangle"
        //- )
        v-transformer(ref="transformer" :config="configShapeTransformer")
div(class="container")
  ToolBar(:stage="stage" :save-canvas="saveCanvas")
</template>
