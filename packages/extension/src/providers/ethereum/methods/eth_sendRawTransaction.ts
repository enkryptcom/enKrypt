import { getCustomError } from "@/libs/error";
import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
import broadcastTx from "../libs/tx-broadcaster";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload,
  res,
  next
): void {
  if (payload.method !== "eth_sendRawTransaction") return next();
  else {
    if (!payload.params || payload.params.length < 1) {
      return res(
        getCustomError("eth_sendTransaction: invalid request not enough params")
      );
    }
    broadcastTx(payload.params[0], this.network.name)
      .then((hash) => {
        res(null, hash);
      })
      .catch(() => next());
  }
};
export default method;
