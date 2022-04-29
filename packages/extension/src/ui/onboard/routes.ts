import { RouteRecordRaw } from "vue-router";
import NewWallet from "./new-wallet.vue";
import CreateWalletUI from "./create-wallet/routes";
import RestoreWalletUI from "./restore-wallet/routes";
let uiRoutes: RouteRecordRaw[] = [];
uiRoutes = uiRoutes.concat(CreateWalletUI());
uiRoutes = uiRoutes.concat(RestoreWalletUI());
const routes = [
  { path: "/", component: NewWallet, name: "new-wallet" },
  ...uiRoutes,
];
export default routes;
