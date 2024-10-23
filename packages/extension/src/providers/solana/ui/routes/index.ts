import solSign from '../sol-sign-message.vue';
import solSendTransaction from '../sol-verify-transaction.vue';
import solConnectDApp from '../sol-connect-dapp.vue';
import solHWVerify from '../send-transaction/verify-transaction/index.vue';
import { RouteRecordRaw } from 'vue-router';
import RouteNames from './names';
const routes = Object.assign({}, RouteNames);
routes.solSign.component = solSign;
routes.solSendTransaction.component = solSendTransaction;
routes.solConnectDApp.component = solConnectDApp;
routes.solHWVerify.component = solHWVerify;
export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map(route => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
