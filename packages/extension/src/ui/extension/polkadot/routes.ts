import ethAccounts from "./dot-accounts.vue";
import { RouteRecordRaw } from "vue-router";
const routes: RouteRecordRaw[] = [
  { path: "/dotaccounts", component: ethAccounts, name: "dotaccounts" },
];
export default (namespace: string): RouteRecordRaw[] => {
  return routes.map((route) => {
    route.path = `/${namespace}${route.path}`;
    route.name = route.name ? `${namespace}-${String(route.name)}` : undefined;
    return route;
  });
};
