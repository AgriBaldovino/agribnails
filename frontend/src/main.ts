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
    defaultTheme: 'agribnails',
    themes: {
      agribnails: {
        dark: false,
        colors: {
          primary: '#8B9D77',     // primario (verde suave)
          secondary: '#EDC5AB',   // secundario (durazno suave)
          accent: '#EDC5AB',      // acento igual al secundario
          info: '#8B9D77',
          success: '#8B9D77',
          warning: '#EDC5AB',
          error: '#B00020',
          background: '#E7EAEF',  // fondo claro
          surface: '#FFFFFF',
        },
      },
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app') 