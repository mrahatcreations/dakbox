import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          primary: '#1565C0',
          surface: '#FAFAFA',
          background: '#F5F5F5',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#64B5F6',
          surface: '#1E1E1E',
          background: '#121212',
        },
      },
    },
  },
  defaults: {
    VBtn: { variant: 'text', rounded: 0 },
    VCard: { rounded: 0, elevation: 0 },
    VTextField: { variant: 'outlined', density: 'comfortable', rounded: 0 },
    VList: { rounded: 0 },
    VChip: { rounded: 0 },
    VNavigationDrawer: { rounded: 0 },
    VAppBar: { elevation: 0 },
  },
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.mount('#app')
