import AddHardwareWallet from "./add-hardware-wallet.vue";
import LedgerConnect from "./ledger/ledger-connect.vue";
import LedgerSelectAccount from "./ledger/ledger-select-account.vue";
import LedgerImportingAccount from "./ledger/ledger-importing-account.vue";
import TrezorConnect from "./trezor/trezor-connect.vue";
import TrezorSelectAccount from "./trezor/trezor-select-account.vue";
import TrezorImportingAccount from "./trezor/trezor-importing-account.vue";

import { RouteRecordRaw } from "vue-router";
export const routes = {
  addHardwareWallet: {
    path: "",
    name: "add-hardware-wallet",
    component: AddHardwareWallet,
  },
  ledgerConnect: {
    path: "ledger-connect",
    name: "ledger-connect",
    component: LedgerConnect,
  },
  ledgerSelectAccount: {
    path: "ledger-select-account",
    name: "ledger-select-account",
    component: LedgerSelectAccount,
  },
  ledgerImportingAccount: {
    path: "ledger-importing-account",
    name: "ledger-importing-account",
    component: LedgerImportingAccount,
  },
  trezorConnect: {
    path: "trezor-connect",
    name: "trezor-connect",
    component: TrezorConnect,
  },
  trezorSelectAccount: {
    path: "trezor-select-account",
    name: "trezor-select-account",
    component: TrezorSelectAccount,
  },
  trezorImportingAccount: {
    path: "trezor-importing-account",
    name: "trezor-importing-account",
    component: TrezorImportingAccount,
  },
};
export const namespace = "hardware-wallet";

export default (): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
