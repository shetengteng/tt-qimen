import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from './router'
import { i18n } from './locales'
import { applyUrlBootstrap } from './composables/useUrlBootstrap'

import './themes/_shared/tailwind.css'
import './themes/_shared/contracts.css'
import './themes/_shared/base.css'

applyUrlBootstrap()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
