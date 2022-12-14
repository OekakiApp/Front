import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/style.css'
import VueKonva from 'vue-konva'
import App from '@/App.vue'
import router from '@/router'
import 'flowbite'
import '@/firebase/index'

const pinia = createPinia()
const app = createApp(App)

app.use(router).use(pinia).use(VueKonva).mount('#app')
