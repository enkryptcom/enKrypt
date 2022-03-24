import Start from "./index.vue";
import { RouteRecordRaw } from "vue-router";
export const routes = {
  start: {
    path: "start",
    name: "start",
    component: Start,
  },
};

export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
