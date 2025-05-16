import { firoElectrum } from '@/providers/bitcoin/libs/electrum-client/electrum-client';
import { createApp } from 'vue';
import Vue3Lottie from 'vue3-lottie';
import App from './App.vue';
import router from './router';
import * as filters from './utils/filters';

global.WeakMap = WeakMap;

if (import.meta.env.DEV) {
  globalThis.__ENKRYPT_DEBUG_LOG_CONF__ = import.meta.env.VITE_DEBUG_LOG;
}

const app = createApp(App);

app.onUnmount(() => {
  firoElectrum.disconnect();
});

firoElectrum.connectMain().then(() => {
  app.use(router).use(Vue3Lottie, { name: 'vue3lottie' });

  app.config.globalProperties.$filters = filters;
  app.mount('#app');
});
