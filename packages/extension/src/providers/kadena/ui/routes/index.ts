import kdaAccounts from "../kda-accounts.vue";
import kdaSignMessage from "../kda-sign-message.vue";
import dotHWVerify from "../send-transaction/verify-transaction/index.vue";
import { RouteRecordRaw } from "vue-router";
import RouteNames from "./names";

const routes = Object.assign({}, RouteNames);
routes.kdaAccounts.component = kdaAccounts;
routes.kdaSignMessage.component = kdaSignMessage;
routes.kdaHWVerify.component = dotHWVerify;

export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
