import unlockKeyring from "./unlock-keyring.vue";
import { RouteRecordRaw } from "vue-router";
export const routes = {
  unlock: {
    path: "unlock-keyring",
    name: "unlockKeyring",
    component: unlockKeyring,
  },
};

export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
