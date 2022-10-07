import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import VueKonva from 'vue-konva'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia).use(VueKonva).mount('#app')
