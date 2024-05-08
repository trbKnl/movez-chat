import './index.css'
import 'floating-vue/dist/style.css'

import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App)

import FloatingVue from 'floating-vue'

app.use(FloatingVue)


app.mount("#app");
