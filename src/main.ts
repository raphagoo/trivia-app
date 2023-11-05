import logger from './interfaces/consoleLogger'
import { router } from './router'
import { store } from './store'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { createApp } from 'vue'
import App from './App.vue'
const vuetify = createVuetify()

const app = createApp(App)
app.use(router)
app.use(store)
app.use(vuetify)
app.mount('#app')
