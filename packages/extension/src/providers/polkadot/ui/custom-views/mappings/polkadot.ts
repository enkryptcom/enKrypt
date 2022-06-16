import { nativeTransfer } from "./substrate";
import TransferView from "../transfer-approvetx.vue";
import { MethodMap } from "../types";

const methodsToArgs: MethodMap = {
  "balances.transferKeepAlive": [TransferView, nativeTransfer],
};

export default methodsToArgs;
