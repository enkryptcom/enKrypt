import { RouteRecordRaw } from 'vue-router';
import NewWallet from './new-wallet.vue';
import UserAnalytics from './user-analytics.vue';
import CreateWalletUI from './create-wallet/routes';
import RestoreWalletUI from './restore-wallet/routes';
import HardwareWalletUI from './hardware-wallet/routes';
let uiRoutes: RouteRecordRaw[] = [];
uiRoutes = uiRoutes.concat(CreateWalletUI());
uiRoutes = uiRoutes.concat(RestoreWalletUI());
uiRoutes = uiRoutes.concat(HardwareWalletUI());
const routes = [...uiRoutes];
if (__IS_FIREFOX__) {
  routes.unshift({
    path: '/new-wallet',
    component: NewWallet,
    name: 'new-wallet',
  });
  routes.unshift({
    path: '/',
    component: UserAnalytics,
    name: 'user-analytics',
  });
  routes.unshift({
    path: '/user-privacy',
    component: UserAnalytics,
    name: 'user-privacy',
  });
} else {
  routes.unshift({ path: '/', component: NewWallet, name: 'new-wallet' });
}
export default routes;
