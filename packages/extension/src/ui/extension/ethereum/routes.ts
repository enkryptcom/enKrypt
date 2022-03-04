import ethAccounts from "./eth-accounts.vue";
import { RouteRecordRaw } from "vue-router";
const routes: RouteRecordRaw[] = [
  { path: "/ethaccounts", component: ethAccounts, name: "ethaccounts" },
];
export default (namespace: string): RouteRecordRaw[] => {
  return routes.map((route) => {
    route.path = `/${namespace}${route.path}`;
    route.name = route.name ? `${namespace}-${String(route.name)}` : undefined;
    return route;
  });
};
