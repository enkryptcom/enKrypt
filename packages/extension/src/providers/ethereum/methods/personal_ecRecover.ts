import { getCustomError } from "@/libs/error";
import { MiddlewareFunction } from "@enkryptcom/types";
import { hexToBuffer } from "@enkryptcom/utils";
import {
  ecrecover,
  fromRpcSig,
  hashPersonalMessage,
  publicToAddress,
} from "ethereumjs-util";
import EthereumProvider from "..";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload,
  res,
  next
): void {
  if (payload.method !== "personal_ecRecover") return next();
  else {
    if (!payload.params || payload.params.length < 2) {
      return res(getCustomError("eth_sign: invalid params"));
    }
    try {
      const hashedMessage = hashPersonalMessage(hexToBuffer(payload.params[0]));
      const { v, r, s } = fromRpcSig(payload.params[1]);
      const recoveredPubKey = ecrecover(hashedMessage, v, r, s);
      return res(null, "0x" + publicToAddress(recoveredPubKey).toString("hex"));
    } catch (e) {
      return res(getCustomError((e as Error).message));
    }
  }
};
export default method;
