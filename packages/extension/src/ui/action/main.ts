import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import * as filters from './utils/filters';
import Vue3Lottie from 'vue3-lottie';
import { createPinia } from 'pinia';

global.WeakMap = WeakMap;

if (import.meta.env.DEV) {
  globalThis.__ENKRYPT_DEBUG_LOG_CONF__ = import.meta.env.VITE_DEBUG_LOG;
}

const app = createApp(App);
const pinia = createPinia();

app.use(router).use(Vue3Lottie, { name: 'vue3lottie' }).use(pinia);

app.config.globalProperties.$filters = filters;
app.mount('#app');
