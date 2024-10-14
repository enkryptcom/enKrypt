import unlockKeyring from "../unlock-keyring.vue";
import loading from "../loading.vue";
import SwapBestOffer from "@action/views/swap/views/swap-best-offer/index.vue";
import { RouteRecordRaw } from "vue-router";
import RouteNames from "./names";
const routes = Object.assign({}, RouteNames);
routes.unlock.component = unlockKeyring;
routes.loading.component = loading;
routes.swapVerifyHW.component = SwapBestOffer;

export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
