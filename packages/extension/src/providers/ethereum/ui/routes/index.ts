import ethAccounts from "../eth-accounts.vue";
import ethSign from "../eth-sign-message.vue";
import ethSendTransaction from "../eth-verify-transaction.vue";
import ethSignTypedData from "../eth-sign-typedata.vue";
import ethEncryptionKey from "../eth-get-encryption-key.vue";
import ethDecrypt from "../eth-decrypt.vue";
import ethConnectDApp from "../eth-connect-dapp.vue";
import { RouteRecordRaw } from "vue-router";
import RouteNames from "./names";
const routes = Object.assign({}, RouteNames);

routes.ethAccounts.component = ethAccounts;
routes.ethSign.component = ethSign;
routes.ethSendTransaction.component = ethSendTransaction;
routes.ethSignTypedData.component = ethSignTypedData;
routes.ethGetEncryptionKey.component = ethEncryptionKey;
routes.ethDecrypt.component = ethDecrypt;
routes.ethConnectDApp.component = ethConnectDApp;
export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
