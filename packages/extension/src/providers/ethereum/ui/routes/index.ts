import ethAccounts from "../eth-accounts.vue";
import ethSign from "../eth-sign-message.vue";
import ethSendTransaction from "../eth-send-transaction.vue";
import { RouteRecordRaw } from "vue-router";
import RouteNames from "./names";
const routes = Object.assign({}, RouteNames);

routes.ethAccounts.component = ethAccounts;
routes.ethSign.component = ethSign;
routes.ethSendTransaction.component = ethSendTransaction;

export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
