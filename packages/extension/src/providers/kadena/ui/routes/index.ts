import kdaAccounts from "../kda-accounts.vue";
import dotSignMessage from "../kda-sign-message.vue";
import dotUpdateMetadata from "../kda-update-metadata.vue";
import dotVerifyTransaction from "../kda-verify-transaction.vue";
import dotHWVerify from "../send-transaction/verify-transaction/index.vue";
import { RouteRecordRaw } from "vue-router";
import RouteNames from "./names";

const routes = Object.assign({}, RouteNames);
routes.kdaAccounts.component = kdaAccounts;
routes.dotSignMessage.component = dotSignMessage;
routes.dotUpdateMetadata.component = dotUpdateMetadata;
routes.dotHWVerify.component = dotHWVerify;

export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
