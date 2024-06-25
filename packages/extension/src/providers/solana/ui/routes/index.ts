import btcSign from "../btc-sign-message.vue";
import btcSendTransaction from "../btc-verify-transaction.vue";
import btcConnectDApp from "../btc-connect-dapp.vue";
import btcHWVerify from "../send-transaction/verify-transaction/index.vue";
import { RouteRecordRaw } from "vue-router";
import RouteNames from "./names";
const routes = Object.assign({}, RouteNames);
routes.btcSign.component = btcSign;
routes.btcSendTransaction.component = btcSendTransaction;
routes.btcConnectDApp.component = btcConnectDApp;
routes.btcHWVerify.component = btcHWVerify;
export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
