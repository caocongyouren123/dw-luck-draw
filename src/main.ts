import './assets/main.css'
import 'element-plus/dist/index.css'

import App from './App.vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as elementPlusIcons from '@element-plus/icons-vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
// 全局注册element-plus图标
Object.keys(elementPlusIcons).forEach(key => {
	app.component(key, elementPlusIcons[key as keyof typeof elementPlusIcons])
})

app.mount('#app')
