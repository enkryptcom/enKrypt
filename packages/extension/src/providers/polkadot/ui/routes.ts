import dotAccounts from "./dot-accounts.vue";
import dotTxApprove from "./dot-approvetx.vue";
import dotApproveSign from "./dot-approvesign.vue";
import { RouteRecordRaw } from "vue-router";
export const routes = {
  dotAccounts: {
    path: "dot-accounts",
    component: dotAccounts,
    name: "dotAccounts",
  },
  dotTxApprove: {
    path: "dot-tx-approve",
    component: dotTxApprove,
    name: "dotTxApprove",
  },
  dotMsgSignApprove: {
    path: "dot-sign-msg-approve",
    component: dotApproveSign,
    name: "dotMsgSignApprove",
  },
};

export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
