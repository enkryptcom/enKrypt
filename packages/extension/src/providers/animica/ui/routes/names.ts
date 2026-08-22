import { RouteRecordRaw } from 'vue-router';

const routes: Record<string, RouteRecordRaw> = {
  send: {
    path: 'send',
    name: 'animica-send',
    component: () => import('../send-transaction/index.vue'),
  },
  verify: {
    path: 'verify',
    name: 'animica-verify',
    component: () => import('../send-transaction/verify-transaction/index.vue'),
  },
};

export default routes;
