import Start from "./start-restore.vue";
import OtherInfo from "./other-info.vue";
import EnterRecoveryPhrase from "./enter-recovery-phrase.vue";
import PickPassword from "./pick-password.vue";
import TypePassword from "./type-password.vue";
import WalletReady from "../create-wallet/wallet-ready.vue";
import { RouteRecordRaw } from "vue-router";
export const routes = {
  start: {
    path: "start",
    name: "start",
    component: Start,
  },
  otherInfo: {
    path: "other-info",
    name: "other-info",
    component: OtherInfo,
  },
  enterRecoveryPhrase: {
    path: "enter-recovery-phrase",
    name: "enter-recovery-phrase",
    component: EnterRecoveryPhrase,
  },
  pickPassword: {
    path: "pick-password",
    name: "pick-password",
    component: PickPassword,
  },
  typePassword: {
    path: "type-password",
    name: "type-password",
    component: TypePassword,
  },
  walletReady: {
    path: "wallet-ready",
    name: "wallet-ready",
    component: WalletReady,
  },
};
export const namespace = "restore-wallet";

export default (): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
