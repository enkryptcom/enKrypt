import ethSign from "../eth-sign-message.vue";
import ethSendTransaction from "../eth-verify-transaction.vue";
import ethSignTypedData from "../eth-sign-typedata.vue";
import ethEncryptionKey from "../eth-get-encryption-key.vue";
import ethDecrypt from "../eth-decrypt.vue";
import ethConnectDApp from "../eth-connect-dapp.vue";
import ethHWVerify from "../send-transaction/verify-transaction/index.vue";
import walletWatchAsset from "../wallet-watch-asset.vue";
import walletAddEthereumNetwork from "../wallet-add-ethereum-network.vue";
import { RouteRecordRaw } from "vue-router";
import RouteNames from "./names";
const routes = Object.assign({}, RouteNames);
routes.ethSign.component = ethSign;
routes.ethSendTransaction.component = ethSendTransaction;
routes.ethSignTypedData.component = ethSignTypedData;
routes.ethGetEncryptionKey.component = ethEncryptionKey;
routes.ethDecrypt.component = ethDecrypt;
routes.ethConnectDApp.component = ethConnectDApp;
routes.ethHWVerify.component = ethHWVerify;
routes.walletWatchAsset.component = walletWatchAsset;
routes.walletAddEthereumChain.component = walletAddEthereumNetwork;
export default (namespace: string): RouteRecordRaw[] => {
  return Object.values(routes).map((route) => {
    route.path = `/${namespace}/${route.path}`;
    route.name = `${namespace}-${String(route.name)}`;
    return route;
  });
};
