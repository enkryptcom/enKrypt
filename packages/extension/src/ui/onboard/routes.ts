import { RouteRecordRaw } from "vue-router";
import NewWallet from "./new-wallet.vue";
import UserAnalytics from "./user-analytics.vue";
import CreateWalletUI from "./create-wallet/routes";
import RestoreWalletUI from "./restore-wallet/routes";
import HardwareWalletUI from "./hardware-wallet/routes";
let uiRoutes: RouteRecordRaw[] = [];
uiRoutes = uiRoutes.concat(CreateWalletUI());
uiRoutes = uiRoutes.concat(RestoreWalletUI());
uiRoutes = uiRoutes.concat(HardwareWalletUI());
const routes = [
  { path: "/", component: NewWallet, name: "new-wallet" },
  { path: "/user-analytics", component: UserAnalytics, name: "user-analytics" },
  ...uiRoutes,
];
export default routes;
