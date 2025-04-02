import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import routes from './routes';
import * as filters from '@action/utils/filters';
import Vue3Lottie from 'vue3-lottie';
import { createPinia } from 'pinia';

global.WeakMap = WeakMap;

if (import.meta.env.DEV) {
  globalThis.__ENKRYPT_DEBUG_LOG_CONF__ = import.meta.env.VITE_DEBUG_LOG;
}

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const pinia = createPinia();
const app = createApp(App);

app.use(router).use(pinia).use(Vue3Lottie, { name: 'vue3lottie' });

app.config.globalProperties.$filters = filters;

app.mount('#app');
