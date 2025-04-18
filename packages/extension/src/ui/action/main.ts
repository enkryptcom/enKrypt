import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import * as filters from './utils/filters';
import Vue3Lottie from 'vue3-lottie';
import { loadWasm } from '@/libs/utils/wasm-loader';
import { firoElectrum } from '@/providers/bitcoin/libs/electrum-client/electrum-client';

global.WeakMap = WeakMap;

if (import.meta.env.DEV) {
  globalThis.__ENKRYPT_DEBUG_LOG_CONF__ = import.meta.env.VITE_DEBUG_LOG
}

const app = createApp(App);

loadWasm().then(wasm => {
  app.provide('wasmModule', wasm); // Make available globally
  firoElectrum.connectMain()
}).catch(err => {
  console.error('Error loading WASM:', err);
}).finally(() => {
  app.use(router).use(Vue3Lottie, { name: 'vue3lottie' });

  app.config.globalProperties.$filters = filters;
  app.mount('#app');
});





// app.mount('#app');
