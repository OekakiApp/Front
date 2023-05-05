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
import useStoreStage from '@/stores/konva/stage'
import useStoreHistory from '@/stores/konva/history'
import WebFont from 'webfontloader'
import _ from 'lodash'
import type { SaveState } from '@/types/index'
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import Konva from 'konva'

// useStore start
const { mode } = storeToRefs(useStoreMode())
const { canvasHistory } = storeToRefs(useStoreHistory())
const { lines } = storeToRefs(useStoreLine())
const { texts, isEditing } = storeToRefs(useStoreText())
const { uid } = storeToRefs(useAuthStore())
const { canvases } = storeToRefs(useStoreCanvas())
const { konvaImages, firstKonvaImages } = storeToRefs(useStoreImage())
const { configShapeTransformer } = storeToRefs(useStoreTransformer())
const { configKonva } = storeToRefs(useStoreStage())

const { setMode } = useStoreMode()
const {
  handleLineMouseDown,
  handleLineMouseMove,
  handleLineMouseUp,
  handleLineMouseLeave,
} = useStoreLine()

const { createNewTextNode, toggleEdit } = useStoreText()

const {
  handleMouseDownTransformer,
  handleTransform,
  handleTransformEnd,
  handleDragEnd,
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
} = useStoreImage()

const { saveImageCountToFirebase } = useStoreUserImage()
const { fitStageIntoParentContainer } = useStoreStage()
const { handleRedo, handleUndo } = useStoreHistory()
// useStore end

const stageParentDiv = ref()
const stage = ref()
const transformer = ref()
const canvasId = ref(useRoute().params.canvas_id as string)
// use when save canvas
const router = useRouter()
const saveState = ref<SaveState>('normal')
// 3 point reader
const isShare = ref(false)
const pointLeaderOpen = ref(false)
// os userArgent
const ua = window.navigator.userAgent.toLocaleLowerCase()
const isWinOS = ua.indexOf('windows nt') !== -1
const isMacOS = ua.indexOf('mac os x') !== -1
const isIPadOS =
  ua.indexOf('ipad') !== -1 ||
  (ua.indexOf('macintosh') !== -1 && 'ontouchend' in document)
// const selectionRectangle = ref()

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
const changeModeByShortCut = (e: KeyboardEvent) => {
  // テキスト編集中はショートカット無効
  if (isEditing.value || inputText.isEditing) return
  // pen
  if (e.key === 'p') {
    setMode('pen')
    useStoreTransformer().$reset()
  }
  // eraser
  else if (e.shiftKey && e.key === 'Backspace') {
    setMode('eraser')
    useStoreTransformer().$reset()
  }
  // text
  else if (e.key === 't') setMode('text')
  // image
  else if (e.key === 'i') setMode('image')
  // undo
  else if (
    (isWinOS && e.ctrlKey && e.key === 'z') ||
    ((isMacOS || isIPadOS) && e.metaKey && e.key === 'z')
  ) {
    handleUndo()
  }
  // redo
  else if (
    (isWinOS && e.ctrlKey && e.key === 'y') ||
    ((isMacOS || isIPadOS) && e.metaKey && e.shiftKey && e.key === 'z')
  ) {
    handleRedo()
  }
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
  fitStageIntoParentContainer(stageParentDiv.value)

  window.addEventListener('resize', () =>
    fitStageIntoParentContainer(stageParentDiv.value),
  )
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
    isShare.value = canvas.isShare === undefined ? false : canvas.isShare
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
  window.removeEventListener('resize', () =>
    fitStageIntoParentContainer(stageParentDiv.value),
  )
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
      isShare: isShare.value,
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
      isShare: isShare.value,
    })
  }
  // 画像の使用枚数の更新
  saveImageCountToFirebase(firstKonvaImages.value, konvaImages.value)
  // 保存時点でのkonvaImagesをセット(画像の使用状況追跡のため)
  firstKonvaImages.value = _.cloneDeep(konvaImages.value)
  // サムネイルを生成・保存
  generateAndSaveThumbnail()
}

// 共有トグルボタン切り替えで発火
const saveIsShare = async (): Promise<void> => {
  isShare.value = !isShare.value
  const canvasID = canvasId.value
  if (canvases.value[canvasID] !== undefined) {
    await updateDoc(doc(db, 'canvas', canvasID), {
      updatedAt: Timestamp.now(),
      isShare: isShare.value,
    })
  }
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

  div(class="relative ml-8")
    button(class="three-dot-leader hover:opacity-80" type="button" @click="pointLeaderOpen = !pointLeaderOpen")
        span(class="dot")
    button(v-show="pointLeaderOpen" tabindex="-1" class="z-10 fixed inset-0 h-full w-full cursor-default" @click="pointLeaderOpen = false")
    div(v-show="pointLeaderOpen"  class="absolute z-10 mt-2 py-2 w-max bg-white rounded-lg shadow-xl")
      div(class="flex items-center cursor-auto px-4 py-2 text-gray-800") 
        span(class="material-symbols-outlined mr-2" style='color:#2F90EA') open_in_new
        div(class="mr-2 text-lg") 共有
        label(class="relative inline-flex items-center cursor-pointer")
          input(:checked="isShare" type="checkbox" class="sr-only peer" @click="saveIsShare()")
          div(class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600")
      label(htmlFor="reset-modal"  class="flex items-center cursor-pointer px-4 py-2 text-gray-800") 
        span(class="material-symbols-outlined mr-2") restart_alt
        div(class="mr-2 text-lg") リセット


div(class="m-auto border-4 border-orange-100 max-w-screen-xl my-4")
  div(ref="stageParentDiv" class="bg-white w-full" @drop="(e) => {setImagesOnCanvas(e, stage)}" @dragover.prevent)
    v-stage(
      ref="stage"
      :config="configKonva"
      @mouseenter="(e: Konva.KonvaEventObject<PointerEvent>) => {handlePointerMouseEnter(e);}"
      @mouseleave="(e: Konva.KonvaEventObject<MouseEvent>) => {handleLineMouseLeave();handlePointerStageMouseLeave(e);}"
      @mousedown="(e: Konva.KonvaEventObject<PointerEvent>) => {handlePointerMouseEnter(e);}"
      @pointerdown="(e: Konva.KonvaEventObject<PointerEvent>) => {handleLineMouseDown(e);handleMouseDownTransformer(e)}"
      @pointermove="(e: Konva.KonvaEventObject<PointerEvent>) => {handleLineMouseMove(e);handlePointerMouseMove(e);}"
      @pointerup="(e: Konva.KonvaEventObject<PointerEvent>) => {handleLineMouseUp(e);}"
      @dblclick="(e: Konva.KonvaEventObject<MouseEvent>) => {createNewTextNode(e);}"
      @dbltap="(e: Konva.KonvaEventObject<TouchEvent>) => {createNewTextNode(e);}"
      )
      v-layer
        v-rect(:config="{name: 'background-rect', x: 0, y: 0, width: configKonva.size.width / configKonva.scale.x, height: configKonva.size.height / configKonva.scale.y, fill: '#FFFFFF'}")
        v-image(
          v-for="image in konvaImages"
          :key="image.id"
          :draggable="mode === 'none'"
          :config="image"
          @dragend="(e: Konva.KonvaEventObject<DragEvent>) => {handleDragEnd(e);}"
          @mouseover="(e: Konva.KonvaEventObject<MouseEvent>) => {handlePointerMouseOver(e);}"
          @mousedown="(e: Konva.KonvaEventObject<MouseEvent>) => {handlePointerMouseDown(e);}"
          @mouseup="(e: Konva.KonvaEventObject<MouseEvent>) => {handlePointerMouseUp(e)}"
          @mouseleave="(e: Konva.KonvaEventObject<MouseEvent>) => {handlePointerMouseLeave(e);}"
          @transform="(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => handleTransform(e)"
          @transformend="handleTransformEnd"
        )
        v-text(
          v-for="text in texts"
          :key="text.id"
          :config="text"
          :draggable="mode === 'text'"
          @dragend="(e: Konva.KonvaEventObject<DragEvent>) => handleDragEnd(e)"
          @mouseover="(e: Konva.KonvaEventObject<MouseEvent>) => {handlePointerMouseOver(e);}"
          @mousedown="(e: Konva.KonvaEventObject<MouseEvent>) => {handlePointerMouseDown(e);}"
          @mouseup="(e: Konva.KonvaEventObject<MouseEvent>) => {handlePointerMouseUp(e)}"
          @mouseleave="(e: Konva.KonvaEventObject<MouseEvent>) => {handlePointerMouseLeave(e);}"
          @transform="(e: Konva.KonvaEventObject<MouseEvent>) => handleTransform(e)"
          @transformend="handleTransformEnd"
          @dblclick="(e: Konva.KonvaEventObject<MouseEvent>) => toggleEdit(e)"
          @dbltap="(e: Konva.KonvaEventObject<TouchEvent>) => toggleEdit(e)"
          )
        v-line(
          v-for="line in lines"
          :key="line.id"
          :config="{id: line.id, name: line.name, stroke:line.color, points:line.points, strokeWidth:line.strokeWidth, dash: line.dash, dashEnabled: line.dashEnabled, tension:0.1, lineCap:'round', lineJoin:'round', hitStrokeWidth: line.hitStrokeWidth, shadowForStrokeEnabled: false}"
          )
        //- pen cursor
        UserCursor
        //- v-rect(
        //- ref="selectionRectangle"
        //- :config="configSelectionRectangle"
        //- )
        v-transformer(ref="transformer" :config="configShapeTransformer")
div(class="container")
  ToolBar(:stage="stage")

input(id="reset-modal" type="checkbox" className="modal-toggle")
div(className="modal")
  div(className="modal-box max-w-none w-auto")
    h3(className="font-bold text-2xl") キャンバスをリセットしてよろしいですか？
    div(class="flex justify-end")
      div(className="modal-action mr-3")
        label(htmlFor="reset-modal" className="btn w-36" @click="pointLeaderOpen = !pointLeaderOpen") Cancel
      div(className="modal-action" @click="pointLeaderOpen = false")
        label(htmlFor="reset-modal" className="btn w-36 bg-red-500 border-none hover:bg-red-600" @click="useStoreCanvas().resetCanvas") OK
</template>

<style scoped>
.three-dot-leader {
  cursor: pointer;
  border: none;
  background: none;
  display: block;
  position: relative;
  /* ボタン要素のサイズ */
  width: 40px;
  height: 40px;
}

.three-dot-leader .dot,
.three-dot-leader .dot::before,
.three-dot-leader .dot::after {
  display: block;
  position: absolute;
  border-radius: 50%;
  /* ドット1つのサイズ */
  width: 6px;
  height: 6px;
  /* ドットの色 */
  background-color: #333;
}

.three-dot-leader .dot {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
}

.three-dot-leader .dot::before,
.three-dot-leader .dot::after {
  content: '';
}

.three-dot-leader .dot::before {
  /* 上側ドットの位置 */
  top: -12px;
}

.three-dot-leader .dot::after {
  /* 下側ドットの位置 */
  top: 12px;
}
</style>
