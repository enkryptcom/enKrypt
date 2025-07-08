import { RouteRecordRaw } from 'vue-router';

const routes: Record<string, RouteRecordRaw> = {
  send: {
    path: 'send',
    name: 'massa-send',
    component: () => import('../send-transaction/index.vue'),
  },
  massaSendTransaction: {
    path: 'send-transaction',
    name: 'massa-send-transaction',
    component: () => import('../send-transaction/index.vue'),
  },
  verify: {
    path: 'verify',
    name: 'massa-verify',
    component: () => import('../send-transaction/verify-transaction/index.vue'),
  },
  accounts: {
    path: 'accounts',
    name: 'massa-accounts',
    component: () => import('../accounts/index.vue'),
  },
  settings: {
    path: 'settings',
    name: 'massa-settings',
    component: () => import('../settings/index.vue'),
  },
};

export default routes; 