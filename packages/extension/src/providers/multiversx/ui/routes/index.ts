import { RouteRecordRaw } from 'vue-router';
import mvxAccounts from '../mvx-accounts.vue';
import mvxSignMessage from '../mvx-sign-message.vue';
import RouteNames from './names';

const routes = Object.assign({}, RouteNames);
routes.mvxAccounts.component = mvxAccounts;
routes.mvxSignMessage.component = mvxSignMessage;

export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map(route => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
