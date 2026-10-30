import { RouteRecordRaw } from 'vue-router';
import NewWallet from './new-wallet.vue';
import UserAnalytics from './user-analytics.vue';
import CreateWalletUI from './create-wallet/routes.js';
import RestoreWalletUI from './restore-wallet/routes.js';
import HardwareWalletUI from './hardware-wallet/routes.js';
import { OnboardRouteName, OnboardRoutePath } from './route-enums';
let uiRoutes: RouteRecordRaw[] = [];
uiRoutes = uiRoutes.concat(CreateWalletUI());
uiRoutes = uiRoutes.concat(RestoreWalletUI());
uiRoutes = uiRoutes.concat(HardwareWalletUI());
const routes = [...uiRoutes];
if (__IS_FIREFOX__) {
  routes.unshift({
    path: OnboardRoutePath.NewWallet,
    component: NewWallet,
    name: OnboardRouteName.NewWallet,
  });
  routes.unshift({
    path: OnboardRoutePath.Root,
    component: UserAnalytics,
    name: OnboardRouteName.UserAnalytics,
  });
  routes.unshift({
    path: OnboardRoutePath.UserPrivacy,
    component: UserAnalytics,
    name: OnboardRouteName.UserPrivacy,
  });
} else {
  routes.unshift({
    path: OnboardRoutePath.Root,
    component: NewWallet,
    name: OnboardRouteName.NewWallet,
  });
}
export default routes;
