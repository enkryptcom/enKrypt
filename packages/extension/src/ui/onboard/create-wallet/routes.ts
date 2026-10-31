import PickPassword from './pick-password.vue';
import TypePassword from './type-password.vue';
import RecoveryPhrase from './recovery-phrase.vue';
import CheckPhrase from './double-check-phrase.vue';
import WalletReady from './wallet-ready.vue';
import UserAnalytics from '../user-analytics.vue';
import { RouteRecordRaw } from 'vue-router';
import { OnboardRouteName, OnboardRoutePath } from '../route-enums';

export const routes = {
  pickPassword: {
    path: OnboardRoutePath.CreateWalletPickPassword,
    name: OnboardRouteName.CreateWalletPickPassword,
    component: PickPassword,
  },
  typePassword: {
    path: OnboardRoutePath.CreateWalletTypePassword,
    name: OnboardRouteName.CreateWalletTypePassword,
    component: TypePassword,
  },
  recoveryPhrase: {
    path: OnboardRoutePath.CreateWalletRecoveryPhrase,
    name: OnboardRouteName.CreateWalletRecoveryPhrase,
    component: RecoveryPhrase,
  },
  checkPhrase: {
    path: OnboardRoutePath.CreateWalletCheckPhrase,
    name: OnboardRouteName.CreateWalletCheckPhrase,
    component: CheckPhrase,
  },
  userAnalytics: {
    path: OnboardRoutePath.CreateWalletUserAnalytics,
    name: OnboardRouteName.CreateWalletUserAnalytics,
    component: UserAnalytics,
  },
  walletReady: {
    path: OnboardRoutePath.CreateWalletReady,
    name: OnboardRouteName.CreateWalletReady,
    component: WalletReady,
  },
};

export default (): RouteRecordRaw[] => {
  return Object.values(routes);
};
