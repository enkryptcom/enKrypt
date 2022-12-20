import { getCustomError } from "@/libs/error";
import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
import { WindowPromise } from "@/libs/window-promise";

import { RPCTxType } from "../types";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload,
  res,
  next
): void {
  if (payload.method !== "btc_sendTransaction") return next();
  else {
    if (!payload.params || payload.params.length < 1) {
      return res(
        getCustomError("btc_sendTransaction: invalid request not enough params")
      );
    }
    const tx = payload.params[0] as RPCTxType;
    this.KeyRing.getAccounts(this.network.signer).then((accounts) => {
      const acc = accounts.find(
        (a) => this.network.displayAddress(a.address) === payload.params![1]
      );
      if (!acc)
        return res(getCustomError("btc_sendTransaction: account not found"));
      const windowPromise = new WindowPromise();
      windowPromise
        .getResponse(
          this.getUIPath(this.UIRoutes.btcSendTransaction.path),
          JSON.stringify({
            ...payload,
            params: [tx, acc, this.network.name],
          }),
          true
        )
        .then(({ error, result }) => {
          if (error) return res(error);
          res(null, JSON.parse(result as string));
        });
    });
  }
};
export default method;
