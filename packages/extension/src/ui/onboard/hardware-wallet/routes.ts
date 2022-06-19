import AddHardwareWallet from "./add-hardware-wallet.vue";
import LedgerConnect from "./ledger/ledger-connect.vue";
import LedgerSelectAccount from "./ledger/ledger-select-account.vue";

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
};
export const namespace = "hardware-wallet";

export default (): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
