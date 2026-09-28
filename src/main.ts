import { router } from './router'
import { store } from './store'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createApp } from 'vue'
import App from './App.vue'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'dark',
        themes: {
            dark: {
                dark: true,
                colors: {
                    background: '#0F0F1A',
                    surface: '#1A1A2E',
                    'surface-variant': '#252540',
                    primary: '#6C63FF',
                    secondary: '#FF6584',
                    accent: '#00D9A6',
                    success: '#00D9A6',
                    error: '#FF4757',
                    warning: '#FFA502',
                    info: '#54A0FF',
                },
            },
            light: {
                dark: false,
                colors: {
                    background: '#F0F2F5',
                    surface: '#FFFFFF',
                    'surface-variant': '#E8EAED',
                    primary: '#6C63FF',
                    secondary: '#FF6584',
                    accent: '#00D9A6',
                    success: '#00D9A6',
                    error: '#FF4757',
                    warning: '#FFA502',
                    info: '#54A0FF',
                },
            },
        },
    },
    defaults: {
        VCard: {
            elevation: 4,
            rounded: 'lg',
        },
        VBtn: {
            rounded: 'pill',
            elevation: 2,
        },
        VTextField: {
            variant: 'outlined',
            density: 'comfortable',
        },
        VSelect: {
            variant: 'outlined',
            density: 'comfortable',
        },
        VSlider: {
            trackColor: 'surface-variant',
        },
        VCheckbox: {
            color: 'primary',
        },
    },
})

const app = createApp(App)
app.use(router)
app.use(store)
app.use(vuetify)
app.mount('#app')
