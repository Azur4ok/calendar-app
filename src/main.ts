import { createApp } from 'vue'
import ToastPlugin from 'vue-toast-notification'

import './assets/main.css'
import 'vue-toast-notification/dist/theme-bootstrap.css'

import App from './App.vue'

const app = createApp(App)
app.use(ToastPlugin)

app.mount('#app')
