import { RouteRecordRaw } from "vue-router";
import Home from "./home.vue";

import EthereumUI from "@/providers/ethereum/ui";
import PolkadotUI from "@/providers/polkadot/ui";
import EnkryptUI from "./enkrypt";
const uiproviders = [EthereumUI, PolkadotUI, EnkryptUI];
let uiRoutes: RouteRecordRaw[] = [];
uiproviders.forEach((provider) => {
  uiRoutes = uiRoutes.concat(provider.routes);
});
const routes = [{ path: "/", component: Home, name: "home" }, ...uiRoutes];
export default routes;
