import dotAccounts from "../dot-accounts.vue";
import dotTxApprove from "../dot-approvetx.vue";
import dotSignMessage from "../dot-sign-message.vue";
import dotUpdateMetadata from "../dot-update-metadata.vue";
import dotVerifyTransaction from "../dot-verify-transaction.vue";
import { RouteRecordRaw } from "vue-router";
import RouteNames from "./names";
const routes = Object.assign({}, RouteNames);
routes.dotAccounts.component = dotAccounts;
routes.dotTxApprove.component = dotTxApprove;
routes.dotSignMessage.component = dotSignMessage;
routes.dotUpdateMetadata.component = dotUpdateMetadata;
routes.dotVerifyTransaction.component = dotVerifyTransaction;
export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
