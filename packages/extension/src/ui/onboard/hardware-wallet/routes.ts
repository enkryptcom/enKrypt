import AddHardwareWallet from "./add-hardware-wallet.vue";
import Connect from "./views/connect.vue";
import SelectAccount from "./views/select-account.vue";
import ImportingAccount from "./views/importing-account.vue";

import { RouteRecordRaw } from "vue-router";
export const routes = {
  addHardwareWallet: {
    path: "",
    name: "add-hardware-wallet",
    component: AddHardwareWallet,
  },
  Connect: {
    path: "connect",
    name: "connect",
    component: Connect,
  },
  SelectAccount: {
    path: "select-account",
    name: "select-account",
    component: SelectAccount,
  },
  ImportingAccount: {
    path: "importing-account",
    name: "importing-account",
    component: ImportingAccount,
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
