import ethAccounts from "./eth-accounts.vue";
import { RouteRecordRaw } from "vue-router";
export const routes = {
  ethaccounts: {
    path: "ethaccounts",
    component: ethAccounts,
    name: "ethaccounts",
  },
};
export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
