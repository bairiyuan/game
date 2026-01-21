// // import './style.css'
// import { createApp } from 'vue'
// import App from './App.vue'
// import router from './router'
// import { createPinia } from 'pinia'

// const app = createApp(App)
// app.use(router)
// app.use(createPinia());
// app.mount('#app')
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// 不导入全局样式，或者导入一个重置的样式
import './style-reset.css'

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.mount('#app')