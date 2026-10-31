import AddHardwareWallet from './add-hardware-wallet.vue';
import Connect from './views/connect.vue';
import SelectAccount from './views/select-account.vue';
import ImportingAccount from './views/importing-account.vue';

import { RouteRecordRaw } from 'vue-router';
import { OnboardRouteName, OnboardRoutePath } from '../route-enums';
export const routes = {
  addHardwareWallet: {
    path: OnboardRoutePath.HardwareWalletRoot,
    name: OnboardRouteName.HardwareWalletAdd,
    component: AddHardwareWallet,
  },
  Connect: {
    path: OnboardRoutePath.HardwareWalletConnect,
    name: OnboardRouteName.HardwareWalletConnect,
    component: Connect,
  },
  SelectAccount: {
    path: OnboardRoutePath.HardwareWalletSelectAccount,
    name: OnboardRouteName.HardwareWalletSelectAccount,
    component: SelectAccount,
  },
  ImportingAccount: {
    path: OnboardRoutePath.HardwareWalletImportingAccount,
    name: OnboardRouteName.HardwareWalletImportingAccount,
    component: ImportingAccount,
  },
};

export default (): RouteRecordRaw[] => {
  return Object.values(routes);
};
