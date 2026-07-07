import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'

// 全局注册自定义组件
import FormDialog from '@/components/FormDialog.vue'
import TableCard from '@/components/TableCard.vue'
import SearchForm from '@/components/SearchForm.vue'
import NavHeader from '@/components/NavHeader.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'

const app = createApp(App)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 注册自定义组件
app.component('FormDialog', FormDialog)
app.component('TableCard', TableCard)
app.component('SearchForm', SearchForm)
app.component('NavHeader', NavHeader)
app.component('SidebarMenu', SidebarMenu)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: undefined })
app.mount('#app')
