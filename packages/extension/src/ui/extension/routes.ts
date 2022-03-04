import { RouteRecordRaw } from "vue-router";
import Home from "./home.vue";

import EthereumUI from "./ethereum";
import PolkadotUI from "./polkadot";
const uiproviders = [EthereumUI, PolkadotUI];
let uiRoutes: RouteRecordRaw[] = [];
uiproviders.forEach((provider) => {
  uiRoutes = uiRoutes.concat(provider.routes);
});
const routes = [{ path: "/", component: Home, name: "home" }, ...uiRoutes];
export default routes;
