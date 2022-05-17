import ethAccounts from "./eth-accounts.vue";
import ethSign from "./eth-sign.vue";
import ethSignMessage from "./eth-sign-message.vue";
import ethVerifyTransaction from "./eth-verify-transaction.vue";

import { RouteRecordRaw } from "vue-router";
export const routes = {
  ethAccounts: {
    path: "eth-accounts",
    component: ethAccounts,
    name: "ethAccounts",
  },
  ethSign: {
    path: "eth-sign",
    component: ethSign,
    name: "ethSign",
  },
  ethSignMessage: {
    path: "eth-sign-message",
    component: ethSignMessage,
    name: "ethSignMessage",
  },
  ethVerifyTransaction: {
    path: "eth-verify-transaction",
    component: ethVerifyTransaction,
    name: "ethVerifyTransaction",
  },
};
export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
