import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import * as filters from './utils/filters';
import Vue3Lottie from 'vue3-lottie';

global.WeakMap = WeakMap;

if (import.meta.env.DEV) {
  globalThis.__ENKRYPT_DEBUG_LOG_CONF__ = import.meta.env.VITE_DEBUG_LOG;
}

const app = createApp(App);

app.use(router).use(Vue3Lottie, { name: 'vue3lottie' });

app.config.globalProperties.$filters = filters;

app.mount('#app');
