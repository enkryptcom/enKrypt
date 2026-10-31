import Start from './start-restore.vue';
import OtherInfo from './other-info.vue';
import EnterRecoveryPhrase from './enter-recovery-phrase.vue';
import PickPassword from './pick-password.vue';
import TypePassword from './type-password.vue';
import WalletReady from '../create-wallet/wallet-ready.vue';
import UserAnalytics from '../user-analytics.vue';
import BackupDetected from './backup-detected.vue';
import { RouteRecordRaw } from 'vue-router';
import { OnboardRouteName, OnboardRoutePath } from '../route-enums';
export const routes = {
  start: {
    path: OnboardRoutePath.RestoreWalletStart,
    name: OnboardRouteName.RestoreWalletStart,
    component: Start,
  },
  otherInfo: {
    path: OnboardRoutePath.RestoreWalletOtherInfo,
    name: OnboardRouteName.RestoreWalletOtherInfo,
    component: OtherInfo,
  },
  enterRecoveryPhrase: {
    path: OnboardRoutePath.RestoreWalletEnterRecoveryPhrase,
    name: OnboardRouteName.RestoreWalletEnterRecoveryPhrase,
    component: EnterRecoveryPhrase,
  },
  pickPassword: {
    path: OnboardRoutePath.RestoreWalletPickPassword,
    name: OnboardRouteName.RestoreWalletPickPassword,
    component: PickPassword,
  },
  typePassword: {
    path: OnboardRoutePath.RestoreWalletTypePassword,
    name: OnboardRouteName.RestoreWalletTypePassword,
    component: TypePassword,
  },
  userAnalytics: {
    path: OnboardRoutePath.RestoreWalletUserAnalytics,
    name: OnboardRouteName.RestoreWalletUserAnalytics,
    component: UserAnalytics,
  },
  backupDetected: {
    path: OnboardRoutePath.RestoreWalletBackupDetected,
    name: OnboardRouteName.RestoreWalletBackupDetected,
    component: BackupDetected,
  },
  walletReady: {
    path: OnboardRoutePath.RestoreWalletReady,
    name: OnboardRouteName.RestoreWalletReady,
    component: WalletReady,
  },
};

export default (): RouteRecordRaw[] => {
  return Object.values(routes);
};
