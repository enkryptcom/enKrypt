import unlockKeyring from "./unlock-keyring.vue";
import { RouteRecordRaw } from "vue-router";
const routes: RouteRecordRaw[] = [
  { path: "/unlock-keyring", component: unlockKeyring, name: "unlockKeyring" },
];
export default (namespace: string): RouteRecordRaw[] => {
  return routes.map((route) => {
    route.path = `/${namespace}${route.path}`;
    route.name = route.name ? `${namespace}-${String(route.name)}` : undefined;
    return route;
  });
};
