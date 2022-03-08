import dotAccounts from "./dot-accounts.vue";
import dotTxApprove from "./dot-approvetx.vue";
import { RouteRecordRaw } from "vue-router";
export const routes = {
  dotAccounts: {
    path: "dot-accounts",
    component: dotAccounts,
    name: "dotaccounts",
  },
  dotTxApprove: {
    path: "dot-tx-approve",
    component: dotTxApprove,
    name: "dotTxApprove",
  },
};

export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
